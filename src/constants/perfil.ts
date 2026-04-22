export const PERFIL_VALUES = ["ADM", "GERENTE", "FUNCIONARIO"] as const;

export type PerfilValue = (typeof PERFIL_VALUES)[number];

export const PERFIL_LABELS: Record<PerfilValue, string> = {
  ADM: "Administrador",
  GERENTE: "Gerente",
  FUNCIONARIO: "Colaborador",
};

export const PERFIL_OPTIONS = PERFIL_VALUES.map((value) => ({
  value,
  label: PERFIL_LABELS[value],
}));

export const getPerfilLabel = (perfil: string) => {
  if (perfil in PERFIL_LABELS) {
    return PERFIL_LABELS[perfil as PerfilValue];
  }
  return perfil;
};