// ============================================================
// ARCHIVO: src/features/carpinteria/services/plantillasMueblesService.ts
// QUÉ HACE: Servicio Firestore para guardar y cargar plantillas de muebles 3D.
// POR QUÉ: Permite reutilizar módulos completos (Cocinas, Clósets, Baños) con 1 clic.
// ============================================================
import { db, coleccion } from '../../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { CabinetSpec } from '../types/cabinet3d';
import { TableroLibre } from '../types/freeDesign';

export type CategoriaPlantillaMueble = 'Cocina' | 'Closets' | 'Baños' | 'Sala / TV' | 'Oficina' | 'Especial';

export interface IPlantillaMueble {
  id?: string;
  nombre: string;
  categoria: CategoriaPlantillaMueble;
  modoDiseno: 'parametrico' | 'libre';
  spec?: CabinetSpec;
  tablerosLibres?: TableroLibre[];
  dimensiones: {
    ancho: number;
    alto: number;
    profundidad: number;
  };
  descripcion?: string;
  createdAt?: any;
  updatedAt?: any;
}

const NOMBRE_COLECCION = 'plantillas_muebles';

export async function obtenerPlantillasMuebles(): Promise<IPlantillaMueble[]> {
  try {
    const colRef = collection(db, coleccion(NOMBRE_COLECCION));
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as IPlantillaMueble[];
  } catch (err) {
    console.error('Error al obtener plantillas de muebles:', err);
    return [];
  }
}

export async function guardarPlantillaMueble(plantilla: Omit<IPlantillaMueble, 'id'>): Promise<string> {
  const colRef = collection(db, coleccion(NOMBRE_COLECCION));
  const docRef = await addDoc(colRef, {
    ...plantilla,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function eliminarPlantillaMueble(id: string): Promise<void> {
  const docRef = doc(db, coleccion(NOMBRE_COLECCION), id);
  await deleteDoc(docRef);
}

export async function sembrarPlantillasBase(): Promise<number> {
  const plantillasBase: Omit<IPlantillaMueble, 'id'>[] = [
    {
      nombre: 'Módulo Bajo 2 Puertas (Cocina)',
      categoria: 'Cocina',
      modoDiseno: 'parametrico',
      dimensiones: { ancho: 800, alto: 750, profundidad: 550 },
      spec: {
        nombre: 'Bajo Mesón 2 Puertas',
        tipo: 'modulo-bajo',
        ancho: 800,
        alto: 750,
        profundidad: 550,
        espesorEstructura: 18,
        espesorFondo: 6,
        numeroRepisas: 1,
        divisionesVerticales: 0,
        puertas: 2,
        numeroCajones: 0,
        aperturaPuertas: false,
        aperturaCajones: false,
        conZocalo: true,
        alturaZocalo: 100,
        acabado: 'roble',
        modoVista: 'solido',
        factorExplosion: 0
      }
    },
    {
      nombre: 'Módulo Bajo 3 Cajones Cacerolero',
      categoria: 'Cocina',
      modoDiseno: 'parametrico',
      dimensiones: { ancho: 600, alto: 750, profundidad: 550 },
      spec: {
        nombre: 'Bajo 3 Cajones Cacerolero',
        tipo: 'modulo-bajo',
        ancho: 600,
        alto: 750,
        profundidad: 550,
        espesorEstructura: 18,
        espesorFondo: 6,
        numeroRepisas: 0,
        divisionesVerticales: 0,
        puertas: 0,
        numeroCajones: 3,
        aperturaPuertas: false,
        aperturaCajones: false,
        conZocalo: true,
        alturaZocalo: 100,
        acabado: 'cedro',
        modoVista: 'solido',
        factorExplosion: 0
      }
    },
    {
      nombre: 'Alacena Aérea 2 Puertas (Cocina)',
      categoria: 'Cocina',
      modoDiseno: 'parametrico',
      dimensiones: { ancho: 800, alto: 600, profundidad: 320 },
      spec: {
        nombre: 'Alacena Aérea 2 Puertas',
        tipo: 'alacena',
        ancho: 800,
        alto: 600,
        profundidad: 320,
        espesorEstructura: 15,
        espesorFondo: 3,
        numeroRepisas: 1,
        divisionesVerticales: 0,
        puertas: 2,
        numeroCajones: 0,
        aperturaPuertas: false,
        aperturaCajones: false,
        conZocalo: false,
        alturaZocalo: 0,
        acabado: 'blanco',
        modoVista: 'solido',
        factorExplosion: 0
      }
    },
    {
      nombre: 'Módulo Torre de Hornos (Cocina)',
      categoria: 'Cocina',
      modoDiseno: 'parametrico',
      dimensiones: { ancho: 600, alto: 2100, profundidad: 580 },
      spec: {
        nombre: 'Torre de Hornos',
        tipo: 'closet-estanteria',
        ancho: 600,
        alto: 2100,
        profundidad: 580,
        espesorEstructura: 18,
        espesorFondo: 6,
        numeroRepisas: 3,
        divisionesVerticales: 0,
        puertas: 2,
        numeroCajones: 2,
        aperturaPuertas: false,
        aperturaCajones: false,
        conZocalo: true,
        alturaZocalo: 100,
        acabado: 'gris',
        modoVista: 'solido',
        factorExplosion: 0
      }
    },
    {
      nombre: 'Clóset / Estantería 4 Repisas',
      categoria: 'Closets',
      modoDiseno: 'parametrico',
      dimensiones: { ancho: 900, alto: 1800, profundidad: 450 },
      spec: {
        nombre: 'Clóset Estantería 4 Repisas',
        tipo: 'closet-estanteria',
        ancho: 900,
        alto: 1800,
        profundidad: 450,
        espesorEstructura: 18,
        espesorFondo: 3,
        numeroRepisas: 4,
        divisionesVerticales: 0,
        puertas: 0,
        numeroCajones: 0,
        aperturaPuertas: false,
        aperturaCajones: false,
        conZocalo: true,
        alturaZocalo: 80,
        acabado: 'arena',
        modoVista: 'solido',
        factorExplosion: 0
      }
    }
  ];

  let creadas = 0;
  for (const p of plantillasBase) {
    await guardarPlantillaMueble(p);
    creadas++;
  }
  return creadas;
}
