import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  ShoppingBag,
  Coins,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ReceiptText,
  DollarSign,
  ChevronRight,
  Eye,
  ArrowLeft,
  Search,
  Sparkles
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { Evento } from '../../types';
import { calcularTotalCaja, formatearEuros } from '../../utils/cashUtils';
import { CrearEventoModal } from './CrearEventoModal';
import { CerrarEventoModal } from './CerrarEventoModal';

export const EventosView: React.FC = () => {
  const {
    eventos,
    eventoActivoId,
    ventas,
    seleccionarEvento
  } = useDataStore();
  const navigate = useNavigate();

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [eventoParaCerrar, setEventoParaCerrar] = useState<Evento | null>(null);
  const [eventoDetalle, setEventoDetalle] = useState<Evento | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const eventosActivos = eventos.filter((e) => e.estado === 'activo');
  const eventosCerrados = eventos.filter((e) => e.estado === 'cerrado');

  const eventosFiltrados = eventos.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.fechaInicio.includes(busqueda)
  );

  const handleAbrirTPV = (eventoId: string) => {
    seleccionarEvento(eventoId);
    navigate('/pos');
  };

  return (
    <div id="view-eventos-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Barra superior de navegación y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Volver al Hub Administrativo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Gestión de Eventos
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {eventosActivos.length} Activo{eventosActivos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Crea eventos independientes, abre su TPV o realiza el arqueo final de cierre
            </p>
          </div>
        </div>

        {/* Botón destacado Crear Nuevo Evento */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-crear-nuevo-evento"
            onClick={() => setModalCrearOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: EVENTOS ACTIVOS */}
      <section id="section-eventos-activos" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Eventos Activos (En Curso)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {eventosActivos.length} evento{eventosActivos.length !== 1 ? 's' : ''} disponible{eventosActivos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {eventosActivos.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-800">No hay eventos activos ahora mismo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Para empezar a registrar ventas en el TPV y controlar la caja, crea un nuevo evento indicando su fondo inicial.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalCrearOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Evento Ahora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {eventosActivos.map((evt) => {
              const totalCajaViva = calcularTotalCaja(evt.cajaActual);
              const totalFondoInicial = calcularTotalCaja(evt.cajaInicial);
              const ventasEvt = ventas.filter((v) => v.eventoId === evt.id && v.estado !== 'devuelta');
              const totalFacturado = ventasEvt.reduce((sum, v) => sum + v.total, 0);
              const esSeleccionado = eventoActivoId === evt.id;

              return (
                <div
                  key={evt.id}
                  id={`card-evento-activo-${evt.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-2xs ${
                    esSeleccionado
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Cabecera de la tarjeta */}
                  <div className="p-5 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ACTIVO
                          </span>
                          {esSeleccionado && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Seleccionado en TPV
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
                          {evt.nombre}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Iniciado: {evt.fechaInicio}
                          {evt.notas && ` · ${evt.notas}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
                          Caja Viva
                        </p>
                        <p className="text-lg sm:text-xl font-black text-slate-900">
                          {formatearEuros(totalCajaViva)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Métricas clave del evento */}
                  <div className="p-5 py-3.5 bg-slate-50/70 grid grid-cols-3 gap-2 border-b border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Fondo Inicial</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">
                        {formatearEuros(totalFondoInicial)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Tickets</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">
                        {ventasEvt.length} ventas
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Ventas</p>
                      <p className="text-xs sm:text-sm font-bold text-blue-600">
                        {formatearEuros(totalFacturado)}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="p-4 bg-white flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setEventoParaCerrar(evt)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cerrar Evento</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAbrirTPV(evt.id)}
                      className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Abrir TPV</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: HISTORIAL DE EVENTOS CERRADOS */}
      <section id="section-eventos-cerrados" className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Historial de Eventos Cerrados ({eventosCerrados.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {eventosCerrados.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No hay eventos cerrados en el histórico todavía.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-tight">
                  <tr>
                    <th className="py-3 px-4 font-bold">Evento</th>
                    <th className="py-3 px-4 font-bold">Fechas</th>
                    <th className="py-3 px-4 font-bold">Fondo Apertura</th>
                    <th className="py-3 px-4 font-bold">Caja Cierre</th>
                    <th className="py-3 px-4 font-bold">Arqueo / Descuadre</th>
                    <th className="py-3 px-4 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventosCerrados
                    .filter((e) => e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                    .map((evt) => {
                      const arqueo = evt.arqueoCierre;
                      const fondoInicial = calcularTotalCaja(evt.cajaInicial);
                      const cajaCierre = arqueo?.totalReal || calcularTotalCaja(evt.cajaActual);
                      const descuadre = arqueo?.diferencia ?? 0;

                      return (
                        <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{evt.nombre}</p>
                            {evt.notas && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{evt.notas}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {evt.fechaInicio} {evt.fechaFin ? `al ${evt.fechaFin}` : ''}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {formatearEuros(fondoInicial)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {formatearEuros(cajaCierre)}
                          </td>
                          <td className="py-3.5 px-4">
                            {arqueo ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] ${
                                  Math.abs(descuadre) < 0.01
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {Math.abs(descuadre) < 0.01 ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Cuadrado (0.00 €)
                                  </>
                                ) : (
                                  <>
                                    {descuadre > 0 ? `+${formatearEuros(descuadre)}` : formatearEuros(descuadre)}
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">Sin arqueo registrado</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setEventoDetalle(evt)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Arqueo</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* MODAL PARA CREAR NUEVO EVENTO */}
      <CrearEventoModal
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onEventCreated={(nuevoId) => {
          seleccionarEvento(nuevoId);
          navigate('/pos');
        }}
      />

      {/* MODAL PARA ARQUEO FINAL Y CIERRE DE EVENTO */}
      {eventoParaCerrar && (
        <CerrarEventoModal
          evento={eventoParaCerrar}
          isOpen={Boolean(eventoParaCerrar)}
          onClose={() => setEventoParaCerrar(null)}
        />
      )}

      {/* MODAL DETALLE DE ARQUEO HISTÓRICO */}
      {eventoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{eventoDetalle.nombre}</h3>
                <p className="text-xs text-slate-400">
                  {eventoDetalle.fechaInicio} al {eventoDetalle.fechaFin || 'Cierre'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEventoDetalle(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {eventoDetalle.arqueoCierre ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Total Real en Caja</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatearEuros(eventoDetalle.arqueoCierre.totalReal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Teórico</span>
                    <span className="text-base font-bold text-slate-700">
                      {formatearEuros(eventoDetalle.arqueoCierre.totalTeorico)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recaudado Efectivo</span>
                    <span className="font-semibold text-emerald-700">
                      {formatearEuros(eventoDetalle.arqueoCierre.totalRecaudadoEfectivo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recaudado TPV</span>
                    <span className="font-semibold text-blue-700">
                      {formatearEuros(eventoDetalle.arqueoCierre.totalRecaudadoTPV)}
                    </span>
                  </div>
                </div>
                {eventoDetalle.arqueoCierre.notas && (
                  <p className="text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold">Notas de cierre:</span> {eventoDetalle.arqueoCierre.notas}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Este evento cerrado no tiene arqueo desglosado.</p>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setEventoDetalle(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
