export function refreshWowheadLinks(delayMs = 80): void {
  window.setTimeout(() => {
    const power = (
      window as Window & { $WowheadPower?: { refreshLinks: () => void } }
    ).$WowheadPower;
    power?.refreshLinks();
  }, delayMs);
}
