export interface Clase {
  id: number;
  modulo: number;
  semana: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  temas: string[];
  audioUrl?: string;
}

// Generar las 195 clases dinámicamente
export const CLASES: Clase[] = Array.from({ length: 195 }, (_, i) => {
  const id = i + 1;
  // 30 clases por módulo = 3 módulos en total
  const modulo = Math.ceil(id / 30);
  const semana = Math.ceil(id / 5);

  // Para Assimil (clases 91-195), mostrar el número real de lección (1-105)
  const isAssimil = id > 90;
  const assimilLesson = id - 90; // 1..105
  const isTaller = isAssimil && assimilLesson % 7 === 0;

  const titulo = isAssimil
    ? (isTaller ? `Repaso · Lección ${assimilLesson}` : `Lección ${assimilLesson}`)
    : `Lección ${id}`;

  return {
    id,
    modulo,
    semana,
    titulo,
    descripcion: isAssimil
      ? (isTaller ? 'Lección de consolidación. Sin audio — consulta el material de apoyo.' : `Lección de Consolidación número ${assimilLesson}.`)
      : `Clase de inmersión auditiva número ${id}.`,
    duracion: "30:00",
    temas: []
  };
});

export const getModulo = (modulo: number): Clase[] => CLASES.filter(c => c.modulo === modulo);
export const getClase = (id: number): Clase | undefined => CLASES.find(c => c.id === id);
export const getTotalClases = (): number => CLASES.length;
export const getModulosList = (): number[] => [1, 2, 3, 4, 5, 6, 7];
export const NOMBRE_MODULO: Record<number, string> = {
  1: "Módulo 1",
  2: "Módulo 2",
  3: "Módulo 3",
  4: "Módulo 4",
  5: "Módulo 5",
  6: "Módulo 6",
  7: "Módulo 7 (Bonus)",
};
