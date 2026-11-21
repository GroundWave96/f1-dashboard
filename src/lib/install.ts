"use client";

/**
 * Instalação do site como aplicativo.
 * - Chrome/Edge (Android e computador): o navegador avisa que dá para instalar (beforeinstallprompt);
 *   guardamos o aviso e mostramos o pedido de instalação quando a pessoa toca no botão.
 * - iPhone/iPad: o Safari não deixa o site pedir; o botão abre as instruções (Compartilhar → Tela de Início).
 * - Já instalado ou navegador sem suporte (ex.: Firefox no computador): o botão não aparece.
 */
import { useSyncExternalStore } from "react";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallMode = "prompt" | "ios" | "none";

let deferred: InstallPromptEvent | null = null;
let installed = false;
// Instruções do iPhone abertas (uma janela só, fora de qualquer menu que possa fechar e levá-la junto)
let iosHelp = false;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** Começa a escutar o navegador. Chamado logo que o app abre: o aviso de instalação chega cedo. */
export function startInstallWatch() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    // Sem a faixa automática do navegador: a instalação fica no nosso botão
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
}

function getMode(): InstallMode {
  if (installed || standalone()) return "none";
  if (deferred) return "prompt";
  return isIos() ? "ios" : "none";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** "prompt" (instala direto), "ios" (mostra as instruções) ou "none" (esconde o botão). */
export const useInstallMode = () => useSyncExternalStore(subscribe, getMode, () => "none" as InstallMode);

/** Instruções do iPhone: abertas ou não. */
export const useIosHelpOpen = () => useSyncExternalStore(subscribe, () => iosHelp, () => false);

export function setIosHelp(open: boolean) {
  iosHelp = open;
  emit();
}

/** Instala direto (Chrome/Edge) ou abre as instruções (iPhone/iPad). */
export function install() {
  if (deferred) void promptInstall();
  else if (getMode() === "ios") setIosHelp(true);
}

/** Abre o pedido de instalação do navegador. */
export async function promptInstall() {
  if (!deferred) return;
  const event = deferred;
  await event.prompt();
  await event.userChoice.catch(() => null);
  // O aviso só pode ser usado uma vez; se a pessoa recusar, o navegador manda outro mais tarde
  deferred = null;
  emit();
}
