export const CITY_STATE_MAP: Record<string, string> = {
  inhambupe: "BA",
  petrolina: "PE",
  alagoinhas: "BA",
  alagoinha: "PE",
  "são paulo": "SP",
  "sao paulo": "SP",
  "rio de janeiro": "RJ",
  "belo horizonte": "MG",
  "porto alegre": "RS",
  curitiba: "PR",
  florianópolis: "SC",
  florianopolis: "SC",
  chapecó: "SC",
  chapeco: "SC",
  recife: "PE",
  salvador: "BA",
  "feira de santana": "BA",
  "vitória da conquista": "BA",
  "vitoria da conquista": "BA",
  camaçari: "BA",
  camacari: "BA",
  juazeiro: "BA",
  itabuna: "BA",
  ilhéus: "BA",
  ilheus: "BA",
  caruaru: "PE",
  olinda: "PE",
  fortaleza: "CE",
  manaus: "AM",
  belém: "PA",
  belem: "PA",
  brasília: "DF",
  brasilia: "DF",
  cuiabá: "MT",
  cuiaba: "MT",
  goiânia: "GO",
  goiania: "GO",
};

const KNOWN_CITIES: Record<
  string,
  { name: string; state: string; countryPt?: string; countryEn?: string }
> = {
  "são paulo": { name: "São Paulo", state: "SP" },
  "sao paulo": { name: "São Paulo", state: "SP" },
  sp: { name: "São Paulo", state: "SP" },
  "rio de janeiro": { name: "Rio de Janeiro", state: "RJ" },
  rj: { name: "Rio de Janeiro", state: "RJ" },
  "belo horizonte": { name: "Belo Horizonte", state: "MG" },
  bh: { name: "Belo Horizonte", state: "MG" },
  "porto alegre": { name: "Porto Alegre", state: "RS" },
  poa: { name: "Porto Alegre", state: "RS" },
  curitiba: { name: "Curitiba", state: "PR" },
  florianópolis: { name: "Florianópolis", state: "SC" },
  florianopolis: { name: "Florianópolis", state: "SC" },
  floripa: { name: "Florianópolis", state: "SC" },
  chapecó: { name: "Chapecó", state: "SC" },
  chapeco: { name: "Chapecó", state: "SC" },
  petrolina: { name: "Petrolina", state: "PE" },
  alagoinhas: { name: "Alagoinhas", state: "BA" },
  alagoinha: { name: "Alagoinha", state: "PE" },
  recife: { name: "Recife", state: "PE" },
  salvador: { name: "Salvador", state: "BA" },
  inhambupe: { name: "Inhambupe", state: "BA" },
  "feira de santana": { name: "Feira de Santana", state: "BA" },
  "vitória da conquista": { name: "Vitória da Conquista", state: "BA" },
  "vitoria da conquista": { name: "Vitória da Conquista", state: "BA" },
  camaçari: { name: "Camaçari", state: "BA" },
  camacari: { name: "Camaçari", state: "BA" },
  juazeiro: { name: "Juazeiro", state: "BA" },
  itabuna: { name: "Itabuna", state: "BA" },
  ilhéus: { name: "Ilhéus", state: "BA" },
  ilheus: { name: "Ilhéus", state: "BA" },
  caruaru: { name: "Caruaru", state: "PE" },
  olinda: { name: "Olinda", state: "PE" },
  fortaleza: { name: "Fortaleza", state: "CE" },
  manaus: { name: "Manaus", state: "AM" },
  belém: { name: "Belém", state: "PA" },
  belem: { name: "Belém", state: "PA" },
  brasília: { name: "Brasília", state: "DF" },
  brasilia: { name: "Brasília", state: "DF" },
  cuiabá: { name: "Cuiabá", state: "MT" },
  cuiaba: { name: "Cuiabá", state: "MT" },
  goiânia: { name: "Goiânia", state: "GO" },
  goiania: { name: "Goiânia", state: "GO" },
  miami: { name: "Miami", state: "FL", countryPt: "EUA", countryEn: "USA" },
  "new york": {
    name: "Nova York",
    state: "NY",
    countryPt: "EUA",
    countryEn: "USA",
  },
  "nova york": {
    name: "Nova York",
    state: "NY",
    countryPt: "EUA",
    countryEn: "USA",
  },
  ny: { name: "Nova York", state: "NY", countryPt: "EUA", countryEn: "USA" },
  tokyo: { name: "Tóquio", state: "", countryPt: "Japão", countryEn: "Japan" },
  tóquio: { name: "Tóquio", state: "", countryPt: "Japão", countryEn: "Japan" },
  london: {
    name: "Londres",
    state: "",
    countryPt: "Reino Unido",
    countryEn: "United Kingdom",
  },
  londres: {
    name: "Londres",
    state: "",
    countryPt: "Reino Unido",
    countryEn: "United Kingdom",
  },
  paris: { name: "Paris", state: "", countryPt: "França", countryEn: "France" },
  roma: { name: "Roma", state: "", countryPt: "Itália", countryEn: "Italy" },
  rome: { name: "Roma", state: "", countryPt: "Itália", countryEn: "Italy" },
  madrid: {
    name: "Madri",
    state: "",
    countryPt: "Espanha",
    countryEn: "Spain",
  },
  madri: { name: "Madri", state: "", countryPt: "Espanha", countryEn: "Spain" },
  berlin: {
    name: "Berlim",
    state: "",
    countryPt: "Alemanha",
    countryEn: "Germany",
  },
  berlim: {
    name: "Berlim",
    state: "",
    countryPt: "Alemanha",
    countryEn: "Germany",
  },
  lisbon: {
    name: "Lisboa",
    state: "",
    countryPt: "Portugal",
    countryEn: "Portugal",
  },
  lisboa: {
    name: "Lisboa",
    state: "",
    countryPt: "Portugal",
    countryEn: "Portugal",
  },
  "buenos aires": {
    name: "Buenos Aires",
    state: "",
    countryPt: "Argentina",
    countryEn: "Argentina",
  },
};

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getCityStateAndCountry(
  cityInput: string,
  lang: string = "pt-BR",
): { city: string; state: string; country: string } {
  const isEn = lang.toLowerCase().startsWith("en");
  const raw = String(cityInput || "").trim();

  if (!raw) {
    return { city: "", state: "", country: "" };
  }

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const originalCity = parts[0] || "";
  const key = originalCity.toLowerCase();
  const known = KNOWN_CITIES[key];

  if (known) {
    return {
      city: known.name,
      state: known.state,
      country: isEn
        ? known.countryEn || (known.countryPt ? "USA" : "Brazil")
        : known.countryPt || "Brasil",
    };
  }

  const stateOrCountry = parts[1] || "";
  const country = parts[2] || "";
  const looksLikeCountry =
    /^(brasil|brazil|eua|usa|united states|france|frança|argentina|japão|japan|portugal|spain|espanha|italy|itália|china|reino unido|united kingdom|uk)$/i.test(
      stateOrCountry,
    );

  return {
    city: titleCase(originalCity),
    state: looksLikeCountry ? "" : mapStateToAbbreviation(stateOrCountry),
    country:
      country ||
      (looksLikeCountry
        ? stateOrCountry
        : /^(br|ba|sp|rj|pe|mg|sc|rs|pr|ce|df|go|mt|ms|am|pa|al|se|pb|rn|pi|ma|es|ac|ap|ro|rr|to)$/i.test(
              stateOrCountry,
            )
          ? isEn
            ? "Brazil"
            : "Brasil"
          : ""),
  };
}

export function mapStateToAbbreviation(stateName: string): string {
  const states: Record<string, string> = {
    acre: "AC",
    alagoas: "AL",
    amapá: "AP",
    amapa: "AP",
    amazonas: "AM",
    bahia: "BA",
    ceará: "CE",
    ceara: "CE",
    "distrito federal": "DF",
    "espírito santo": "ES",
    "espirito santo": "ES",
    goiás: "GO",
    goias: "GO",
    maranhão: "MA",
    maranhao: "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    pará: "PA",
    para: "PA",
    paraíba: "PB",
    paraiba: "PB",
    paraná: "PR",
    parana: "PR",
    pernambuco: "PE",
    piauí: "PI",
    piaui: "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    rondônia: "RO",
    rondonia: "RO",
    roraima: "RR",
    "santa catarina": "SC",
    "são paulo": "SP",
    "sao paulo": "SP",
    sergipe: "SE",
    tocantins: "TO",
    ac: "AC",
    al: "AL",
    ap: "AP",
    am: "AM",
    ba: "BA",
    ce: "CE",
    df: "DF",
    es: "ES",
    go: "GO",
    ma: "MA",
    mt: "MT",
    ms: "MS",
    mg: "MG",
    pa: "PA",
    pb: "PB",
    pr: "PR",
    pe: "PE",
    pi: "PI",
    rj: "RJ",
    rn: "RN",
    rs: "RS",
    ro: "RO",
    rr: "RR",
    sc: "SC",
    sp: "SP",
    se: "SE",
    to: "TO",
  };

  const key = String(stateName || "")
    .trim()
    .toLowerCase();
  return (states[key] || stateName || "").toUpperCase().trim();
}

export function normalizeCityStateAndCountry(
  obj: any,
  lang: string = "pt-BR",
): any {
  if (!obj || typeof obj !== "object") return obj;

  const cityName = obj.city || obj.query || "";
  const resolved = getCityStateAndCountry(cityName, lang);

  if (!obj.city && resolved.city) obj.city = resolved.city;
  if (!obj.state && resolved.state) obj.state = resolved.state;
  if (!obj.country && resolved.country) obj.country = resolved.country;

  if (obj.state) obj.state = mapStateToAbbreviation(obj.state);

  const normCity = String(obj.city || "")
    .trim()
    .toLowerCase();
  if (!obj.state && normCity && CITY_STATE_MAP[normCity]) {
    obj.state = CITY_STATE_MAP[normCity];
  }

  return obj;
}

export function getRegionByState(stateCode: string): string {
  const north = ["AM", "RR", "AP", "PA", "TO", "RO", "AC"];
  const northeast = ["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"];
  const centerWest = ["MT", "MS", "GO", "DF"];
  const southeast = ["SP", "RJ", "ES", "MG"];
  const south = ["PR", "SC", "RS"];
  const st = String(stateCode || "")
    .toUpperCase()
    .trim();

  if (north.includes(st)) return "Norte";
  if (northeast.includes(st)) return "Nordeste";
  if (centerWest.includes(st)) return "Centro-Oeste";
  if (southeast.includes(st)) return "Sudeste";
  if (south.includes(st)) return "Sul";
  return "Nacional";
}
