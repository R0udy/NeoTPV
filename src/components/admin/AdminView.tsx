import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { AppSettings } from '../../types';
import { isFirebaseConfigured, testFirebaseConnection, firebaseConfig } from '../../config/firebaseConfig';
import { onedriveConfig } from '../../config/onedriveConfig';
import {
  Settings,
  AlertTriangle,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Store,
  ShieldCheck,
  ExternalLink,
  Info,
  Activity,
  RefreshCw,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminView: React.FC = () => {
  const {
    settings,
    actualizarSettings,
    alertas,
    isMockActive,
    setMockMode,
    reiniciarDatosMock,
    purgarMockDeFirebase,
  } = useDataStore();

  const [nombreTienda, setNombreTienda] = useState(settings.nombreTienda || 'KiraKira Stand & Jewels');
  const [umbralStock, setUmbralStock] = useState(settings.umbralStockBajo || 5);
  const [umbralCaja, setUmbralCaja] = useState(settings.umbralMonedasBajas || 5);
  const [isSaving, setIsSaving] = useState(false);

  // Estado del test de conexión a Firebase
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    code?: string;
    details?: string;
  } | null>(null);

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Error inesperado al probar conexión',
        details: err?.message || String(err),
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleGuardarAjustes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const nuevos: AppSettings = {
      ...settings,
      nombreTienda,
      umbralStockBajo: Number(umbralStock),
      umbralMonedasBajas: Number(umbralCaja)
    };
    await actualizarSettings(nuevos);
    setIsSaving(false);
  };

  const handleToggleMock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    await setMockMode(checked);
  };

  const alertasError = alertas.filter((a) => a.gravedad === 'error');
  const alertasWarning = alertas.filter((a) => a.gravedad === 'warning');
  const alertasInfo = alertas.filter((a) => a.gravedad === 'info');

  return (
    <div id="admin-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-[#F0EBE3] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800">
              Administración y Ajustes
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistema de alertas inteligentes, configuración de datos y persistencia
            </p>
          </div>
        </div>

        {/* Badge de Estado Activo */}
        <div
          className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            isMockActive
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-[#E8F5E9] text-[#2E7D32] border-emerald-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>
            Proveedor:{' '}
            {isMockActive ? 'Mock Data (LocalStorage)' : 'Firebase Firestore'}
          </span>
        </div>
      </div>

      {/* ================= SECCIÓN 1: SISTEMA DE AVISOS INTELIGENTES ================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-[#F0EBE3] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold font-display text-slate-800">
              Sistema de Avisos y Diagnósticos ({alertas.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {alertasError.length} críticos · {alertasWarning.length} advertencias
          </span>
        </div>

        {alertas.length === 0 ? (
          <div className="p-5 rounded-xl bg-[#E8F5E9] border border-emerald-200 flex items-center gap-3 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-[#2E7D32] shrink-0" />
            <div>
              <p className="text-sm font-bold">Todo en orden en el stand</p>
              <p className="text-xs text-emerald-800">
                No se detectaron problemas de stock bajo, falta de monedas en caja ni márgenes anómalos.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertas.map((alerta) => {
              let bg = 'bg-[#F8F9FA] border-[#F0EBE3] text-slate-800';
              let badge = 'bg-slate-200 text-slate-700';

              if (alerta.gravedad === 'error') {
                bg = 'bg-rose-50 border-rose-200 text-rose-950';
                badge = 'bg-rose-500 text-white';
              } else if (alerta.gravedad === 'warning') {
                bg = 'bg-amber-50 border-amber-200 text-amber-950';
                badge = 'bg-amber-500 text-white';
              } else if (alerta.gravedad === 'info') {
                bg = 'bg-[#E3F2FD] border-blue-200 text-blue-950';
                badge = 'bg-[#2196F3] text-white';
              }

              return (
                <div key={alerta.id} className={`p-4 rounded-xl border space-y-1.5 ${bg}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">{alerta.titulo}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${badge}`}>
                      {alerta.gravedad.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{alerta.descripcion}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= SECCIÓN 2: TOGGLE DE DATOS MOCKUP Y ARQUITECTURA ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Toggle Mock Data */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-[#F0EBE3] space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#2196F3]" />
            <h2 className="text-base font-bold font-display text-slate-800">
              Conmutador de Proveedor de Datos
            </h2>
          </div>

          <div className="p-4 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  Activar Datos Mockup (LocalStorage)
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {isMockActive
                    ? 'Toda la app lee y escribe en localStorage aislado.'
                    : 'Toda la app lee y escribe en Firestore (FirebaseProvider).'}
                </span>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={isMockActive}
                  onChange={handleToggleMock}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#2196F3]"></div>
              </label>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-[#F0EBE3] space-y-1">
              <p>
                • <strong>Mockup ON:</strong> Usa datos locales de prueba precargados.
              </p>
              <p>
                • <strong>Mockup OFF:</strong> Conexión por defecto a Firebase Firestore.
              </p>
              <p>
                • <strong>Aislamiento total:</strong> Activar mock NO modifica ni toca Firebase.
              </p>
            </div>
          </div>

          {/* Acciones del Modo Activo */}
          <div className="pt-1">
            {isMockActive ? (
              <button
                type="button"
                id="btn-reiniciar-mock"
                onClick={reiniciarDatosMock}
                className="w-full py-3 px-4 rounded-xl border border-[#F0EBE3] hover:bg-slate-100 active:scale-98 font-bold text-xs text-slate-700 transition-all flex items-center justify-center gap-2 touch-press cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#2196F3]" />
                <span>Restablecer Catálogo y Ventas Mock por Defecto</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-purgar-mock-firebase"
                onClick={purgarMockDeFirebase}
                className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 active:scale-98 font-bold text-xs text-rose-700 transition-all flex items-center justify-center gap-2 touch-press cursor-pointer"
                title="Elimina cualquier referencia de productos o ventas de prueba que haya quedado guardada en Firestore"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Purgar Residuos Mockup de Firestore</span>
              </button>
            )}
          </div>
        </div>

        {/* Formulario de Ajustes Generales del Stand */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-[#F0EBE3] space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#2196F3]" />
            <h2 className="text-base font-bold font-display text-slate-800">
              Ajustes del Stand y Evento
            </h2>
          </div>

          <form onSubmit={handleGuardarAjustes} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Tienda / Stand
              </label>
              <input
                type="text"
                value={nombreTienda}
                onChange={(e) => setNombreTienda(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Umbral Stock Bajo (uds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={umbralStock}
                  onChange={(e) => setUmbralStock(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Umbral Monedas Bajas (uds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={umbralCaja}
                  onChange={(e) => setUmbralCaja(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] text-white font-bold text-xs shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Ajustes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= SECCIÓN 3: ESTADO TÉCNICO DE INTEGRACIONES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Firebase */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0EBE3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-800">Capa Firebase Firestore</span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isFirebaseConfigured()
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isFirebaseConfigured() ? 'Proyecto: ' + firebaseConfig.projectId : 'Sin Configurar'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Persistencia en tiempo real de productos, ventas, estado de caja y configuración en Firestore.
          </p>

          {/* Botón de test de conexión en vivo */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              id="btn-test-firebase"
              onClick={handleTestFirebase}
              disabled={isTestingFirebase}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTestingFirebase ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Comprobando conexión con Firestore...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Probar Conexión en Vivo con Firebase</span>
                </>
              )}
            </button>

            {/* Resultado del test */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>

                {testResult.details && (
                  <p className="text-[11px] font-mono opacity-80 pl-6 break-all">
                    Detalles: {testResult.details}
                  </p>
                )}

                {!testResult.success && testResult.code === 'permission-denied' && (
                  <div className="mt-2 p-2 rounded-lg bg-white/80 border border-rose-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-rose-800">💡 Cómo solucionarlo en 1 minuto:</p>
                    <p>1. Abre <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Firebase Console &gt; Firestore &gt; Reglas</a>.</p>
                    <p>2. Cambia la regla a: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-rose-900">allow read, write: if true;</code></p>
                    <p>3. Pulsa "Publicar" (Publish) y vuelve a pulsar "Probar Conexión".</p>
                  </div>
                )}

                {!testResult.success && (testResult.code === 'not-found' || testResult.code === 'unavailable') && (
                  <div className="mt-2 p-2 rounded-lg bg-white/80 border border-rose-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-amber-800">💡 Base de datos no creada:</p>
                    <p>Abre <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Firebase Console &gt; Firestore Database</a> y haz clic en <strong>"Crear base de datos"</strong> en modo de prueba.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* OneDrive */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0EBE3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-slate-800">OneDrive / Galería Visual</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Transformador de URLs
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Soporta enlaces compartidos de fotos de OneDrive (transforma <code>1drv.ms</code> a descarga directa para las fichas de producto).
          </p>
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" /> Fotos de productos
            </p>
            <p className="text-[11px] text-blue-800">
              Pega cualquier enlace compartido de OneDrive al crear o editar un producto y el visor lo mostrará automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
