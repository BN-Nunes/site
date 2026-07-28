import { formatHeadquartersAddress, siteContacts } from "./site-contacts";

/**
 * Dados jurídicos do controlador que ainda não foram confirmados e não devem
 * ser inventados. Preencha estes campos somente com informações validadas
 * pelo jurídico/administrativo da Impakto. Enquanto forem `null`, a página de
 * privacidade evita exibi-los como fato e usa apenas o nome fantasia e o
 * canal de atendimento já públicos no site.
 */
export const PENDING_LEGAL_REVIEW = {
  /** Razão social do controlador de dados (pessoa jurídica). */
  companyLegalName: null as string | null,
  /** CNPJ do controlador de dados. */
  companyTaxId: null as string | null,
  /** Nome do encarregado (DPO) pela LGPD, se a empresa tiver designado um. */
  dataProtectionOfficerName: null as string | null,
  /** Canal específico do encarregado, se diferente do SAC geral. */
  dataProtectionOfficerContact: null as string | null,
};

export const knownContact = {
  tradeName: siteContacts.tradeName,
  supportEmail: siteContacts.sac.email,
  address: formatHeadquartersAddress(),
};
