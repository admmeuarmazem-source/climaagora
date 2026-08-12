import React from 'react';

export const TermsContent: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-300 leading-relaxed text-xs">
      <div className="border-b border-white/10 pb-4 mb-4">
        <h1 className="text-sm font-black text-white uppercase tracking-wider mb-2">
          TERMOS E CONDIÇÕES DE USO, CONSULTA EDUCATIVA, ISENÇÃO TOTAL DE RESPONSABILIDADE E POLÍTICAS DE PRIVACIDADE
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
          Última atualização: Julho de 2026 • Versão 5.0 Global (Brasil, Américas, Europa e Ásia)
        </p>
      </div>

      <p className="font-medium text-slate-200">
        Ao instalar, acessar, cadastrar-se ou utilizar o aplicativo <strong className="text-white font-extrabold">ClimaAgora IA</strong>, o usuário declara ter lido, compreendido e aceito integralmente os presentes Termos e Condições de Uso, vinculando-se legalmente e irrestritamente às disposições aqui descritas.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2">
        <p className="font-black text-amber-300 uppercase text-[11px]">
          ⚠️ AVISO IMPORTANTE SOBRE CONSULTA EDUCATIVA E PREVISÕES METEOROLÓGICAS:
        </p>
        <p className="text-[11px] text-amber-100/90 font-semibold leading-relaxed">
          1. Esta plataforma destina-se unicamente para <strong>CONSULTA EDUCATIVA E INFORMATIVA AUXILIAR</strong>.<br />
          2. Todas as informações, gráficos, mapas, radares e índices apresentados tratam-se estritamente de <strong>PREVISÕES E ESTIMATIVAS PROBABILÍSTICAS E NÃO DE CERTEZAS ABSOLUTAS</strong>.<br />
          3. É dever inafastável do usuário <strong>CONFRONTAR E BASEAR-SE EM OUTRAS FONTES OFICIAIS</strong> (órgãos governamentais de meteorologia e defesa civil de seu país) e <strong>VALER-SE DA OBSERVAÇÃO DAS CONDIÇÕES EM TEMPO REAL</strong> no local antes de tomar qualquer decisão.<br />
          4. O aplicativo, seus desenvolvedores e administradores estão <strong>TOTALMENTE ISENTOS DE QUAISQUER PREJUÍZOS, ACIDENTES, PERDAS, DANOS MATERIAIS, MORAIS OU MORTE</strong>.
        </p>
      </div>

      <p className="font-semibold text-rose-400/90 bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-2xl">
        Caso o usuário não concorde integralmente com qualquer disposição deste documento, deverá interromper imediatamente a utilização do aplicativo e efetuar a desconexão de sua conta.
      </p>

      <hr className="border-white/5 my-4" />

      {/* 1. OBJETO E CARÁTER PURAMENTE EDUCATIVO E PROBABILÍSTICO */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span className="text-[#4A90E2]">#</span> 1. OBJETO, CONSULTA EDUCATIVA E NATUREZA DAS PREVISÕES
        </h2>
        <p>
          O ClimaAgora IA é uma ferramenta tecnológica de inteligência preditiva para visualização didática e educativa de dados meteorológicos, índices ambientais, irradiação solar, tábuas de marés, mapas interativos, notícias climáticas e assistente virtual baseado em modelos de inteligência artificial.
        </p>
        <p className="font-semibold text-slate-200">
          O usuário reconhece expressamente que a atmosfera terrestre é um sistema caótico e altamente dinâmico. Desta forma, todas as saídas de dados representam <strong>modelagens probabilísticas suscetíveis a variações e divergências</strong>, não devendo jamais ser interpretadas como garantias infalíveis, certezas absolutas ou laudos meteorológicos oficiais.
        </p>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 2. DEVER DO USUÁRIO DE CONSULTAR FONTES OFICIAIS E TEMPO REAL */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2 text-sky-400">
          <span className="text-[#4A90E2]">#</span> 2. DEVER DE CHECAGEM EM FONTES OFICIAIS E TEMPO REAL
        </h2>
        <p>
          Antes de realizar deslocamentos, viagens terrestres, navegações marítimas, voos, plantios, colheitas, eventos ao ar livre, obras ou qualquer atividade sensível às intempéries do tempo, o usuário compromete-se obrigatoriamente a:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-200">
          <li>
            Consultar os boletins meteorológicos oficiais do órgão público competente de seu país ou região (exemplo: órgão meteorológico nacional e Defesa Civil no Brasil; NOAA/NWS nas Américas; ECMWF, Met Office, DWD ou Météo-France na Europa; JMA ou CMA na Ásia).
          </li>
          <li>
            Verificar visualmente e presencialmente a evolução das condições climáticas no <strong>tempo real</strong> no exato local de sua permanência ou trajeto.
          </li>
          <li>
            Não utilizar o aplicativo como fonte única ou exclusiva para salvar vidas, proteção contra acidentes ou preservação de patrimônio em situações de tempestades severas, ciclones, ressacas ou desastres naturais.
          </li>
        </ul>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 3. ISENÇÃO TOTAL DE RESPONSABILIDADE POR PREJUÍZOS, ACIDENTES, PERDAS, DANOS E MORTE */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2 text-red-400">
          <span className="text-[#4A90E2]">#</span> 3. ISENÇÃO TOTAL E ABSOLUTA DE RESPONSABILIDADE POR PREJUÍZOS, ACIDENTES, PERDAS, DANOS E MORTE
        </h2>
        <p className="font-extrabold text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          NA MÁXIMA EXTENSÃO PERMITIDA PELA LEGISLAÇÃO APLICÁVEL, A PLATAFORMA CLIMAAGORA IA, SEUS CRIADORES, DESENVOLVEDORES DE CÓDIGO, ENGENHEIROS, ADMINISTRADORES, DIRETORES, PARCEIROS E PROVEDORES DE DADOS FICAM EXPRESSA, INTEGRAL E IRREVOGAVELMENTE ISENTOS DE QUALQUER RESPONSABILIDADE POR:
        </p>
        <ul className="list-disc pl-5 space-y-2 font-medium text-slate-200 mt-2">
          <li>
            <strong className="text-white">Perdas Financeiras e Danos Materiais:</strong> Qualquer prejuízo econômico, perda de colheita agrícola, avaria em painéis fotovoltaicos, atrasos em obras, cancelamento de eventos ou danos a veículos, bens materiais e infraestruturas.
          </li>
          <li>
            <strong className="text-white">Acidentes de Trânsito, Marítimos ou Aéreos:</strong> Acidentes automobilísticos, sinistros em embarcações, problemas em navegação de marés ou incidentes de aviação decorrentes de ventos, visibilidade reduzida, granizo ou pista molhada.
          </li>
          <li>
            <strong className="text-white">Lesões Corporais, Danos à Saúde e Morte:</strong> Quaisquer acidentes pessoais, traumas, enfermidades decorrentes de ondas de calor ou frio extremo, descargas elétricas por raios ou casos de <strong>morte</strong> provocados por fenômenos climáticos severos.
          </li>
          <li>
            <strong className="text-white">Interrupções e Erros Tecnológicos:</strong> Falhas de sinal de internet, indisponibilidade de servidores de dados de terceiros, imprecisões de localização via GPS do dispositivo do usuário ou atrasos no recebimento de notificações push do navegador.
          </li>
        </ul>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 4. ABRANGÊNCIA GEOGRÁFICA INTERNACIONAL */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span className="text-[#4A90E2]">#</span> 4. ABRANGÊNCIA INTERNACIONAL (BRASIL, AMÉRICAS, EUROPA E ÁSIA)
        </h2>
        <p>
          O ClimaAgora IA é operado para atendimento a usuários localizados no <strong>Brasil, países das Américas (Norte, Central e do Sul), Europa, Ásia e demais continentes</strong>. O usuário reconhece que é o único responsável pela observância das leis de trânsito, navegação, aviação, uso da água e segurança do trabalho aplicáveis no país ou jurisdição em que se encontra.
        </p>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 5. SUSPENSÃO DE SERVIÇO, BLOQUEIO E EXCLUSÃO DO USUÁRIO */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2 text-rose-400">
          <span className="text-[#4A90E2]">#</span> 5. SUSPENSÃO DE SERVIÇO, BLOQUEIO E EXCLUSÃO DEFINITIVA
        </h2>
        <p>
          O Administrador reserva-se o direito de, a qualquer momento e sem necessidade de prévio aviso, suspender ou excluir a conta de usuários que praticarem uso indevido, tentativa de ataque cibernético, engenharia reversa ou violação dos princípios de boa-fé, sem gerar qualquer direito a indenização.
        </p>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 6. DIREITO DE ARREPENDIMENTO E CANCELAMENTO */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2 text-emerald-400">
          <span className="text-[#4A90E2]">#</span> 6. CANCELAMENTO E DIREITO DE ARREPENDIMENTO
        </h2>
        <p>
          O cancelamento da assinatura de planos pagos pode ser efetuado a qualquer momento pelo usuário através das configurações da conta. Respeitam-se integralmente o Código de Defesa do Consumidor (CDC, Art. 49) no Brasil (7 dias) e a legislação correspondente na União Europeia e demais países.
        </p>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 7. LEGISLAÇÃO E FORO */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span className="text-[#4A90E2]">#</span> 7. LEGISLAÇÃO APLICÁVEL E ELEIÇÃO DE FORO
        </h2>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de <strong>Salvador, Estado da Bahia, Brasil</strong>, para dirimir eventuais controvérsias, com renúncia expressa a qualquer outro.
        </p>
      </section>

      <hr className="border-white/5 my-4" />

      {/* 8. ATRIBUIÇÃO LEGAL E LICENÇAS DE DADOS */}
      <section className="space-y-2">
        <h2 className="text-white font-black uppercase tracking-wider text-[11px] flex items-center gap-2 text-sky-400">
          <span className="text-[#4A90E2]">#</span> 8. ATRIBUIÇÃO LEGAL E LICENÇAS DE DADOS METEOROLÓGICOS
        </h2>
        <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
          Em conformidade com os requisitos de licenças abertas, os serviços de modelagem climática e dados meteorológicos integrados na retaguarda da plataforma ClimaAgora IA utilizam dados sob a licença <strong className="text-white">Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> do Open-Meteo Weather API (open-meteo.com), bem como dados abertos do Instituto Nacional de Meteorologia (INMET - Governo Federal do Brasil), NOAA e ECMWF. Todos os direitos de marcas registradas pertencem aos seus respectivos titulares.
        </p>
      </section>

      <div className="mt-6 font-black text-white bg-slate-900 border border-white/10 p-4 rounded-2xl text-center text-[11px]">
        Ao clicar em &quot;Aceito&quot; ou continuar navegando no ClimaAgora IA, você atesta que leu e concorda integralmente com a consulta educativa, natureza probabilística das previsões e isenção de responsabilidade.
      </div>
    </div>
  );
};
