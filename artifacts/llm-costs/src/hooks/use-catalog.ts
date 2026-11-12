import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOCAL_MODELS, fetchCatalog, mergeCatalog, type Model } from '@/lib/models';

export type CatalogStatus = 'loading' | 'live' | 'fallback';

export function useCatalog() {
  const [apiModels, setApiModels] = useState<Model[] | null>(null);
  const [status, setStatus] = useState<CatalogStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setStatus('loading');
    setError(null);
    fetchCatalog(8000, ctrl.signal)
      .then((models) => {
        if (ctrl !== ctrlRef.current) return;
        setApiModels(models);
        setStatus('live');
      })
      .catch((e: unknown) => {
        if (ctrl !== ctrlRef.current) return;
        const msg = e instanceof DOMException && e.name === 'AbortError'
          ? 'Tempo limite de 8 segundos excedido.'
          : e instanceof Error ? e.message : 'Falha desconhecida.';
        setError(msg);
        setStatus('fallback');
      });
  }, []);

  useEffect(() => {
    load();
    return () => { const c = ctrlRef.current; ctrlRef.current = null; c?.abort(); };
  }, [load]);

  const models = useMemo(() => mergeCatalog(apiModels ?? []), [apiModels]);
  const liveCount = apiModels?.length ?? 0;
  return { models, status, error, retry: load, liveCount, localCount: LOCAL_MODELS.length };
}
