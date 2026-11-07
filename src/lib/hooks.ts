"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent } from "react";

/** Horário atual, atualizado a cada `intervalMs`. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/**
 * Carrega dados assíncronos identificados por `key`. Quando a chave muda, refaz a busca;
 * `null` não busca nada. Ignora respostas que chegam depois de a chave ter mudado.
 */
export function useAsyncData<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: unknown }>({ key: null });
  // silent: nova tentativa em segundo plano, mantendo o resultado anterior na tela até a resposta chegar
  const [attempt, setAttempt] = useState({ n: 0, silent: false });
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  const requestKey = key === null ? null : `${key}#${attempt.n}`;

  useEffect(() => {
    if (requestKey === null) return;
    let cancelled = false;
    loadRef.current().then(
      (data) => !cancelled && setState({ key: requestKey, data }),
      (error) => {
        if (cancelled) return;
        console.error(`Erro ao carregar "${key}":`, error);
        setState({ key: requestKey, error });
      }
    );
    return () => {
      cancelled = true;
    };
    // `key` só é usado na mensagem de erro; `requestKey` já muda junto com ele
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const settled = requestKey !== null && state.key === requestKey;
  const keepPrevious = !settled && attempt.silent && key !== null && state.key?.startsWith(`${key}#`) === true;
  const visible = settled || keepPrevious;
  return {
    data: visible ? state.data : undefined,
    error: visible ? state.error : undefined,
    loading: requestKey !== null && !visible,
    reload: () => setAttempt((a) => ({ n: a.n + 1, silent: false })),
    retrySilently: () => setAttempt((a) => ({ n: a.n + 1, silent: true })),
  };
}

/** Chama `retry` a cada `ms` enquanto `active` for true (e só com a aba visível). */
export function useRetryEvery(ms: number, retry: () => void, active: boolean) {
  const retryRef = useRef(retry);

  useEffect(() => {
    retryRef.current = retry;
  });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (!document.hidden) retryRef.current();
    }, ms);
    return () => clearInterval(id);
  }, [ms, active]);
}

/** Largura de um elemento, atualizada quando ele é redimensionado. */
export function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, width] as const;
}

/** Largura e altura de um elemento, atualizadas quando ele é redimensionado. */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, size] as const;
}

/** Fecha algo (modal, menu) ao apertar Esc. */
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
}

/**
 * Comportamento de janela (modal): fecha com Esc, deixa o resto da página inerte
 * (Tab não sai da janela, leitor de tela não lê o fundo) e devolve o foco a quem a abriu.
 */
export function useDialog(onClose: () => void) {
  useEscapeKey(onClose);
  // Lido na renderização: quando o efeito roda, o autoFocus já moveu o foco para dentro da janela
  const [trigger] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    // #app = barras de navegação + página (as janelas ficam fora dele, direto no body)
    const app = document.getElementById("app");
    app?.setAttribute("inert", "");
    return () => {
      app?.removeAttribute("inert");
      trigger?.focus({ preventScroll: true });
    };
  }, [trigger]);
}

/** true enquanto a media query (ex.: "(min-width: 640px)") for verdadeira; acompanha mudanças da tela. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** true quando o sistema pede "reduzir movimento". */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Props para tornar um elemento não-botão (ex.: linha de tabela) clicável também pelo teclado. */
export function clickableProps(onActivate: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e: ReactKeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
