import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  Search,
  Shield,
  Volume2,
  Filter,
  Globe,
  Sliders,
  Sparkles,
  Printer,
  FileText,
  Activity,
  Layers,
  Database,
  Lock,
  Bell,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info
} from 'lucide-react';
import { SupportedLanguage } from '../i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  isAdmin: boolean;
}

interface HelpItem {
  id: string;
  category: 'user' | 'admin';
  title: string;
  icon: any;
  summary: string;
  details: string[];
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  lang,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'user' | 'admin'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('search-telemetry');

  const helpItems: HelpItem[] = [
    {
      id: 'search-telemetry',
      category: 'user',
      title: 'Barra de Busca e Geolocalização GPS',
      icon: Globe,
      summary: 'Como buscar qualquer cidade do mundo ou ativar a localização GPS.',
      details: [
        'Barra de Pesquisa Superior: Digite o nome de qualquer cidade do Brasil ou do mundo.',
        'Botão "GPS / Minha Localização": Ativa a leitura instantânea do sensor de localização do seu dispositivo para carregar a previsão da sua posição exata.'
      ]
    },
    {
      id: 'cards-principais',
      category: 'user',
      title: 'Guia de CARDS PRINCIPAIS da Dashboard',
      icon: Layers,
      summary: 'Explicação detalhada da função de cada Card principal do aplicativo.',
      details: [
        'Card Clima Atual & Tempo Real: Exibe a temperatura instantânea, sensação térmica, condição do céu e dados atmosféricos em tempo real.',
        'Card Tábua Astronômica de Marés: Traz os picos de maré alta e baixa, coeficientes hidrodinâmicos, fases da lua e alertas marítimos para pescadores e marinheiros.',
        'Card Geração Solar Fotovoltaica & Radiação: Monitora a irradiação solar incidente (W/m²), pico máximo, eficiência do arranjo e projeção diária de geração de energia (kWh).',
        'Card Macro-Clima & Teleconexões Globais: Exibe os grandes índices oceânicos (El Niño/ENSO, IOD, MJO, AMO) e seus efeitos no regime de chuvas e temperaturas.',
        'Card Alertas do Navegador (Web Push API): Serviço de avisos push ativo por padrão para emergências, tempestades, geadas e ventanias com confirmação de risco.',
        'Card Radar de Precipitação (RainViewer): Exibe tempestades em movimento com controle de ruído de fundo (0% a 100%) e previsão imediata (nowcasting).',
        'Card Mapa de Riscos Meteorológicos (CIE): Renderiza camadas 3D de vento, chuva acumulada, descargas elétricas (raios), qualidade do ar e focos de queimada (NASA VIIRS).',
        'Card Central de Decisões Setoriais: Analisa variáveis climáticas para emitir diagnósticos automatizados para Agricultura, Pecuária, Solar e Navegação.',
        'Card Previsão Estendida (14 Dias): Exibe gráficos de tendência térmica e pluvial para planejamento de médio prazo.',
        'Card Reportar Erros / Sugestões ao Administrador: Permite enviar mensagens diretas, relatos de falhas ou sugestões ao administrador do sistema.'
      ]
    },
    {
      id: 'mini-cards-indicadores',
      category: 'user',
      title: 'Guia de MINI-CARDS (Sub-Indicadores Múltiplos)',
      icon: Activity,
      summary: 'Explicação do propósito de cada mini-card de medições ambientais.',
      details: [
        'Mini-Card Qualidade do Ar (AQI): Mede o índice de poluição (MP2.5, MP10, NO2, O3) e classifica a salubridade do ar.',
        'Mini-Card Índice UV: Indica a intensidade de radiação ultravioleta e o tempo máximo de exposição solar segura.',
        'Mini-Card Pressão Atmosférica: Exibe a pressão em hPa e a tendência (queda indica aproximação de tempestades e frentes frias).',
        'Mini-Card Ponto de Orvalho: Mede a temperatura em que o vapor de água se condensa, crucial para prever geadas ou orvalho.',
        'Mini-Card Umidade Relativa do Ar: Mede a saturação de umidade no ar (valores abaixo de 20% indicam estado de alerta de secura).',
        'Mini-Card Ventos e Rajadas Máximas: Exibe velocidade média (km/h), direção cardinal e velocidade máxima de rajada.',
        'Mini-Card Iluminação Lunar & Fase: Percentual de visibilidade do disco lunar e influência no coeficiente de marés.',
        'Mini-Card Horários de Nascer e Pôr do Sol: Contagem regressiva do fotoperíodo útil solar para safras e parques solares.',
        'Mini-Card Eficiência Fotovoltaica (%): Rendimento dos inversores em relação à temperatura atual dos painéis.',
        'Mini-Card Estresse Térmico Pecuário (ITU): Métrica de conforto térmico do gado de leite e corte.'
      ]
    },
    {
      id: 'botoes-aplicativo',
      category: 'user',
      title: 'Guia de BOTÕES e Ações da Interface',
      icon: Sliders,
      summary: 'Função de todos os botões e ferramentas interativas da tela.',
      details: [
        'Botão "COMPARAR CIDADES" (Flutuante Movel): Permite selecionar e comparar lado a lado os indicadores de duas ou mais cidades simultaneamente. Pode ser arrastado livremente pela tela.',
        'Botão "SOM ON / MUDO" (Cabeçalho): Liga ou desliga a paisagem sonora sintetizada em tempo real (sons de chuva, vento ou pássaros).',
        'Botão "GERAR PDF" (Cabeçalho): Compila e baixa um Laudo Técnico Meteorológico oficial formatado para impressão ou envio por e-mail.',
        'Botão "BIOMETRIA / WEBAUTHN": Cadastra autenticação biométrica (face, digital, passkey) para login seguro e sem senhas.',
        'Botão "PERSONALIZAR TEMA / CONTRASTE": Abre a gaveta de ajuste visual (modo claro, escuro, alto contraste e cores de acento).',
        'Botão "FILTRO DE RUÍDO" (No Radar): Deslizante de 0% a 100% que limpa chuvas fracas de fundo no radar para focar em núcleos de tempestade.',
        'Botão "AJUDA" (No Rodapé e Menu): Abre esta Central de Ajuda interativa com explicações detalhadas de todos os componentes.',
        'Botão "REPORTAR ERRO / ENVIAR SUGESTÃO": Abre o formulário direto para contato com a equipe de administração.',
        'Botão "DESATIVAR ALERTAS / ACEITAR RISCOS": Inicia a janela de confirmação e isenção de responsabilidade para pausar notificações push.',
        'Botão "SELETOR DE IDIOMAS": Alterna a interface instantaneamente entre Português, Inglês, Espanhol e outros idiomas.'
      ]
    },
    {
      id: 'ambient-audio',
      category: 'user',
      title: 'Sons Ambientais e Experiência Sonora do Clima',
      icon: Volume2,
      summary: 'Áudio atmosférico em tempo real que reflete as condições meteorológicas da sua localização.',
      details: [
        'O ClimaAgora IA possui um sintetizador de áudio atmosférico imersivo que reproduz o som suave de chuva, trovoadas, ventanias ou canto de pássaros em dias ensolarados.',
        'No cabeçalho principal, clique no botão "Som On / Mudo" para ativar ou silenciar o áudio a qualquer momento.',
        'Os efeitos sonoros mudam dinamicamente assim que a condição do tempo ou o horário atual se altera.'
      ]
    },
    {
      id: 'radar-noise-filter',
      category: 'user',
      title: 'Radar de Precipitação (RainViewer) & Filtro de Ruído',
      icon: Filter,
      summary: 'Ajuste do controle de ruído de 0% a 100% para isolar tempestades e precipitações extremas.',
      details: [
        'Acesse o painel "Radar de Precipitação" na central do mapa interativo.',
        'O radar utiliza dados em tempo real da rede RainViewer e sensores de precipitação com suporte a timeline e nowcast.',
        'Utilize o controle deslizante "Filtro de Ruído" para eliminar ecos de chuva fraca de fundo.',
        'Caso não haja cobertura direta de radar físico na região, o aplicativo ativa automaticamente a Estimativa Visual de Precipitação do Motor ClimaAgora IA.'
      ]
    },
    {
      id: 'decision-center',
      category: 'user',
      title: 'Central de Decisões Setoriais (Agricultura, Pecuária, Solar, Pesca e Navegação)',
      icon: Activity,
      summary: 'Matriz de recomendação inteligente baseada nos limiares críticos de cada setor econômico.',
      details: [
        'O aplicativo analisa continuamente temperatura, vento, umidade, radiação solar e pluviometria para emitir pareceres setoriais.',
        'Agricultura: Recomendações para pulverização, plantio, colheita e risco de geada ou estresse hídrico.',
        'Pecuária: Índice ITU (Índice de Temperatura e Umidade) para conforto térmico e manejo do gado.',
        'Energia Solar: Estimativa de irradiação global horizontal (GHI) e eficiência dos painéis fotovoltaicos.',
        'Pesca e Navegação: Condições de vento marítimo, pressão atmosférica, rajadas e tábua astronômica de marés.'
      ]
    },
    {
      id: 'cie-risk-map',
      category: 'user',
      title: 'Mapa de Riscos (Climate Intelligence Engine - CIE)',
      icon: Layers,
      summary: 'Visualização geográfica de camadas meteorológicas, rajadas de vento 3D e focos de calor.',
      details: [
        'Interaja com o mapa para alternar entre as camadas: Precipitação Acumulada, Campo Térmico, Rajadas de Vento 3D, Descargas Elétricas (Raios), Qualidade do Ar (AQI) e Focos de Queimadas NASA VIIRS.',
        'Ative o modo de tela cheia para monitoramento em monitores de grande porte ou tablets no campo.'
      ]
    },
    {
      id: 'ai-assistant-models',
      category: 'user',
      title: 'Assistente Climático Inteligente',
      icon: Sparkles,
      summary: 'Atendimento e tira-dúvidas meteorológicas com inteligência artificial.',
      details: [
        'Na aba "Assistente", converse com nosso Especialista Climático para tirar dúvidas específicas sobre manejo de safras, janelas de chuva ou alertas marítimos.'
      ]
    },
    {
      id: 'pdf-reports-customization',
      category: 'user',
      title: 'Relatórios PDF para Impressão & Personalização de Temas',
      icon: Printer,
      summary: 'Geração de laudos técnicos em PDF e personalização de cores e esquemas visuais.',
      details: [
        'Clique no botão "PDF" no cabeçalho para gerar instantaneamente um Laudo Técnico Meteorológico pronto para impressão ou envio a seguradoras e cooperativas.',
        'Clique no ícone de controles no topo para abrir a gaveta de Personalização, ajustando cores do tema, esquema Claro/Escuro ou Automático.'
      ]
    },
    {
      id: 'plans-subscriptions',
      category: 'user',
      title: 'Planos, Assinaturas e Gerenciamento de Conta',
      icon: FileText,
      summary: 'Como funciona o Plano Gratuito, Pro e Enterprise, além de suporte ao cliente.',
      details: [
        'Acesse a aba "Planos" na barra inferior para conferir os recursos de cada categoria.',
        'O Plano Pro desbloqueia radar em alta definição sem anúncios, alertas por SMS/WhatsApp e relatórios ilimitados.',
        'Você pode gerenciar ou cancelar sua assinatura a qualquer momento com garantia total e respeito ao CDC / leis do consumidor.'
      ]
    }
  ];

  // Exclusive Admin Items
  if (isAdmin) {
    helpItems.push(
      {
        id: 'admin-subscribers',
        category: 'admin',
        title: '🛡️ [ADMIN EXCLUSIVO] Gestão de Assinantes & Usuários',
        icon: Users,
        summary: 'Painel completo para controle de usuários cadastrados, privilégios e status da assinatura.',
        details: [
          'Acesse a aba "Admin" > "Assinantes".',
          'Visualize o histórico completo de cadastros, e-mails verificados, data de entrada e tipo de plano ativo (Free, Pro, Enterprise).',
          'Você pode alterar manualmente o plano de qualquer usuário, conceder cortesias VIP, redefinir senhas ou aplicar suspensões administrativas em caso de violação das regras.'
        ]
      },
      {
        id: 'admin-calibrations',
        category: 'admin',
        title: '🛡️ [ADMIN EXCLUSIVO] Calibração de Estações & Sensores',
        icon: Sliders,
        summary: 'Ajustes finos de offset de temperatura, pressão e umidade para corrigir anomalias de estações locais.',
        details: [
          'Na aba "Calibração", você pode aplicar fatores de correção (+/- °C, +/- hPa, +/- %) para microclimas específicos.',
          'Garante que leituras de sensores locais fiquem em alinhamento com as medições oficiais de referência.'
        ]
      },
      {
        id: 'admin-ads',
        category: 'admin',
        title: '🛡️ [ADMIN EXCLUSIVO] Gestão de Anúncios Patrocinados',
        icon: FileText,
        summary: 'Módulo de gerenciamento de banners comerciais e campanhas de parceiros agrícolas.',
        details: [
          'Cadastre, edite ou desative anúncios exibidos no carrossel da parte inferior do aplicativo.',
          'Defina título, descrição, link de destino patrocinado e controle a taxa de rotação automática do carrossel.'
        ]
      },
      {
        id: 'admin-broadcast-alerts',
        category: 'admin',
        title: '🛡️ [ADMIN EXCLUSIVO] Envio de Alertas Globais (Push & Popups)',
        icon: Bell,
        summary: 'Disparo imediato de avisos de tempestades severas e emergência civil para todos os usuários ativos.',
        details: [
          'Envie boletins técnicos de emergência para regiões específicas ou para a base completa de usuários.',
          'Os alertas acionam banners vermelhos de alta visibilidade e notificações em tempo real na plataforma.'
        ]
      },
      {
        id: 'admin-system-security',
        category: 'admin',
        title: '🛡️ [ADMIN EXCLUSIVO] Segurança, Diagnósticos e Backups na Nuvem',
        icon: Lock,
        summary: 'Auditoria de segurança, logs de sistema e acionamento de backups manuais em nuvem (GCS).',
        details: [
          'Acompanhe o tráfego em tempo real, latência dos servidores e logs de requisições de API.',
          'Execute backups manuais sob demanda com apenas um clique para armazenar o estado do banco no Google Cloud Storage.',
          'Acesse ferramentas de moderação para bloquear endereços IP suspeitos ou contas envolvidas em fraudes ou abuso do sistema.'
        ]
      }
    );
  }

  // Filter items
  const filteredItems = helpItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999999] flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-slate-900/95 border border-white/10 rounded-3xl max-w-3xl w-full h-[90vh] max-h-[800px] flex flex-col text-white shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/15 border border-sky-500/30 rounded-2xl text-sky-400">
                <HelpCircle size={22} />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                  Central de Ajuda & Guia Completo
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Documentação detalhada das funcionalidades e diretrizes operacionais.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-white/5 bg-slate-950/40 space-y-3 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por funcionalidade, radar, admin, marés, alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 focus:border-sky-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                  selectedCategory === 'all'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Todas as Seções
              </button>

              <button
                onClick={() => setSelectedCategory('user')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                  selectedCategory === 'user'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Para Usuários
              </button>

              {isAdmin && (
                <button
                  onClick={() => setSelectedCategory('admin')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 ${
                    selectedCategory === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  <Shield size={12} />
                  Área do Administrador
                </button>
              )}
            </div>
          </div>

          {/* Accordion List Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Info size={32} className="mx-auto text-slate-500" />
                <p className="text-xs text-slate-300 font-bold">Nenhum tópico encontrado para a sua pesquisa.</p>
                <p className="text-[10px] text-slate-500">Tente buscar outros termos como "radar", "maré", "admin" ou "alerta".</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const ItemIcon = item.icon;
                const isExpanded = expandedItemId === item.id;
                const isAdminItem = item.category === 'admin';

                return (
                  <div
                    key={item.id}
                    className={`border rounded-2xl transition duration-200 overflow-hidden ${
                      isAdminItem
                        ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-950/60 border-white/10 hover:border-sky-500/40'
                    }`}
                  >
                    {/* Item Header */}
                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="w-full p-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isAdminItem
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-sky-500/15 text-sky-400'
                          }`}
                        >
                          <ItemIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                              {item.title}
                            </h3>
                            {isAdminItem && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                                Restrito
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400 shrink-0">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Item Content Expansion */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 pt-1 border-t border-white/5 bg-slate-950/40"
                        >
                          <ul className="space-y-2 mt-2">
                            {item.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed font-medium">
                                <CheckCircle2
                                  size={14}
                                  className={`shrink-0 mt-0.5 ${
                                    isAdminItem ? 'text-amber-400' : 'text-sky-400'
                                  }`}
                                />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 font-semibold">
              <Shield size={12} className="text-emerald-400" />
              Precisa de ajuda adicional? Entre em contato com a equipe de suporte oficial.
            </span>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-wider px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Fechar Guia
            </button>
          </div>
        </motion.div>
      </div>
  );
};
