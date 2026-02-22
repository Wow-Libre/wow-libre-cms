# Especificación Backend: Pase de Batalla (Wow Core)

Este documento define el contrato de API y el esquema de base de datos que debe implementar **Wow Core** para el pase de batalla. La entrega es por **personaje**, **cuenta** y **reino**.

---

## 1. Modelo de datos (SQL)

### 1.1 Temporada del pase (reino)

```sql
CREATE TABLE battle_pass_season (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  realm_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_realm_active (realm_id, is_active),
  INDEX idx_realm_dates (realm_id, start_date, end_date)
);
```

- Una temporada tiene **inicio** y **fin**. Solo una temporada activa por reino (o la que cumpla `start_date <= NOW() <= end_date`).
- **Reinicio de pase**: crear una nueva temporada con nuevas fechas; los que no llegaron a reclamar en la anterior ya no pueden hacerlo.

### 1.2 Premios por nivel (1–80)

```sql
CREATE TABLE battle_pass_reward (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  season_id BIGINT NOT NULL,
  level INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(512),
  core_item_id INT NOT NULL COMMENT 'ID del item en el core del juego',
  wowhead_id INT NULL COMMENT 'ID para enlace/tooltip Wowhead',
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_season_level (season_id, level),
  INDEX idx_season (season_id),
  CONSTRAINT fk_reward_season FOREIGN KEY (season_id) REFERENCES battle_pass_season(id) ON DELETE CASCADE
);
```

- **level**: 1 a 80 (nivel del pase = nivel del personaje para desbloquear).
- **image_url**, **name**, **core_item_id**, **wowhead_id**: configurables desde dashboard.

### 1.3 Reclamaciones (por personaje, cuenta, reino)

```sql
CREATE TABLE battle_pass_claim (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  season_id BIGINT NOT NULL,
  realm_id INT NOT NULL,
  account_id INT NOT NULL,
  character_id INT NOT NULL,
  reward_id BIGINT NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_character_reward (season_id, realm_id, account_id, character_id, reward_id),
  INDEX idx_character_progress (season_id, realm_id, account_id, character_id),
  CONSTRAINT fk_claim_season FOREIGN KEY (season_id) REFERENCES battle_pass_season(id),
  CONSTRAINT fk_claim_reward FOREIGN KEY (reward_id) REFERENCES battle_pass_reward(id)
);
```

- Una fila por cada beneficio reclamado por ese personaje en esa temporada y reino.

---

## 2. Contrato de API

Base URL: `{BASE_URL_CORE}/api/battle-pass`

Headers comunes: `Authorization: Bearer {token}`, `Content-Type: application/json`, `transaction_id: {uuid}`, `Accept-Language: {language}`.

### 2.1 Obtener temporada activa (cliente)

**GET** `/season?realm_id={realm_id}`

**Respuesta 200:**

```json
{
  "code": 200,
  "message": "OK",
  "transaction_id": "...",
  "data": {
    "id": 1,
    "realm_id": 1,
    "name": "Temporada 1",
    "start_date": "2025-01-01T00:00:00",
    "end_date": "2025-03-31T23:59:59",
    "is_active": true
  }
}
```

Si no hay temporada activa: **204** sin body o `data: null`.

---

### 2.2 Listar premios por temporada (cliente)

**GET** `/rewards?realm_id={realm_id}&season_id={season_id}`

**Respuesta 200:**

```json
{
  "code": 200,
  "message": "OK",
  "transaction_id": "...",
  "data": [
    {
      "id": 1,
      "season_id": 1,
      "level": 1,
      "name": "Bolsa de monedas",
      "image_url": "https://...",
      "core_item_id": 12345,
      "wowhead_id": 12345
    }
  ]
}
```

Ordenar por `level` ascendente. Debe poder haber hasta 80 premios (niveles 1–80).

---

### 2.3 Progreso del personaje (cliente)

**GET** `/progress?realm_id={realm_id}&account_id={account_id}&character_id={character_id}&season_id={season_id}`

El backend debe obtener el **nivel del personaje** desde el core (characters) para ese `character_id` en ese reino.

**Respuesta 200:**

```json
{
  "code": 200,
  "message": "OK",
  "transaction_id": "...",
  "data": {
    "character_level": 45,
    "claimed_reward_ids": [1, 2, 3, 5, 10]
  }
}
```

- **character_level**: nivel actual del personaje (determina hasta qué nivel del pase puede reclamar).
- **claimed_reward_ids**: IDs de `battle_pass_reward` ya reclamados por ese personaje en esa temporada.

---

### 2.4 Reclamar beneficio (cliente)

**POST** `/claim`

**Body:**

```json
{
  "realm_id": 1,
  "account_id": 123,
  "character_id": 456,
  "season_id": 1,
  "reward_id": 5
}
```

**Validaciones:**

1. La temporada debe estar activa (`start_date <= NOW() <= end_date`).
2. El personaje debe existir y pertenecer a la cuenta en ese reino.
3. El nivel del personaje debe ser >= `battle_pass_reward.level` del premio.
4. El premio debe pertenecer a esa temporada.
5. No debe estar ya reclamado (no existe fila en `battle_pass_claim` para ese season/realm/account/character/reward).

Si todo es válido:

- Insertar en `battle_pass_claim`.
- Entregar el ítem al personaje en el juego (usar `core_item_id` y la lógica existente de entrega por personaje/cuenta/reino).

**Respuesta 200:** `data` puede ser `{}` o el objeto de la reclamación.

**Errores:** 400 si validación falla (mensaje claro); 404 si temporada o premio no existen.

---

### 2.5 Admin: CRUD temporadas

- **GET** `/admin/seasons?realm_id={realm_id}` — listar temporadas del reino.
- **POST** `/admin/seasons` — crear temporada (body: `realm_id`, `name`, `start_date`, `end_date`).
- **PUT** `/admin/seasons/{id}` — actualizar temporada.
- **DELETE** `/admin/seasons/{id}` — eliminar (solo si no hay reclamaciones o según regla de negocio).

### 2.6 Admin: CRUD premios

- **GET** `/admin/rewards?realm_id={realm_id}&season_id={season_id}` — listar premios de la temporada.
- **POST** `/admin/rewards` — crear premio (body: `season_id`, `level`, `name`, `image_url`, `core_item_id`, `wowhead_id`).
- **PUT** `/admin/rewards/{id}` — actualizar premio.
- **DELETE** `/admin/rewards/{id}` — eliminar premio.

### 2.7 Admin: Reinicio / cierre de pase

- No es un endpoint obligatorio: “reinicio” = crear una **nueva temporada** con nuevas fechas. Los jugadores que no reclamaron en la temporada anterior ya no pueden (la temporada anterior queda fuera de rango `end_date < NOW()`).
- Opcional: **POST** `/admin/seasons/{id}/close` — marcar `is_active = 0` y/o `end_date = NOW()` para cerrar antes.

---

## 3. Resumen de reglas

| Regla | Descripción |
|-------|-------------|
| Entrega | Por **personaje**, **cuenta** y **reino** (igual que otras entregas del core). |
| Niveles | 80 niveles máximos; cada premio asociado a un nivel 1–80. |
| Desbloqueo | Un nivel del pase se desbloquea cuando el **nivel del personaje** es >= ese nivel. |
| Reclamar | Solo si la temporada está vigente y el personaje tiene nivel suficiente y no lo ha reclamado ya. |
| Reinicio | Nueva temporada con inicio/fin; la anterior deja de aceptar reclamaciones. |

Implementando estos endpoints y tablas en Wow Core, el CMS (frontend) podrá consumir la API tal como se describe en la feature `battle-pass` del repositorio.
