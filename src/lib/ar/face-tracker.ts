/**
 * Estrutura de rastreamento facial (MediaPipe FaceMesh / FaceLandmarker).
 *
 * Só pode ser usada no navegador: importe dinamicamente dentro de useEffect
 * ou de um handler, nunca no escopo do módulo de uma rota.
 */

export const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
export const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/** Índices do FaceMesh usados nos cálculos ópticos. */
export const LANDMARKS = {
  irisEsquerda: 468,
  irisEsquerdaBorda: [469, 470, 471, 472],
  irisDireita: 473,
  irisDireitaBorda: [474, 475, 476, 477],
  pontaNariz: 1,
  baseNariz: 168,
  orelhaEsquerda: 234,
  orelhaDireita: 454,
} as const;

/** Diâmetro médio da íris humana em mm — referência para converter px → mm. */
export const IRIS_MM = 11.7;

export type Ponto = { x: number; y: number; z?: number };

export type FaceTracker = {
  detect: (video: HTMLVideoElement, timestampMs: number) => Ponto[] | null;
  close: () => void;
};

/** Carrega o FaceLandmarker em modo VIDEO. Chame apenas no cliente. */
export async function criarFaceTracker(): Promise<FaceTracker> {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  return {
    detect: (video, timestampMs) => {
      const res = landmarker.detectForVideo(video, timestampMs);
      const face = res.faceLandmarks?.[0];
      return face ? (face as Ponto[]) : null;
    },
    close: () => landmarker.close(),
  };
}

export const distancia = (a: Ponto, b: Ponto) => Math.hypot(a.x - b.x, a.y - b.y);

export const media = (pontos: Ponto[]): Ponto => ({
  x: pontos.reduce((s, p) => s + p.x, 0) / pontos.length,
  y: pontos.reduce((s, p) => s + p.y, 0) / pontos.length,
});

export type GeometriaOptica = {
  /** centro das pupilas em px do canvas */
  pupilaEsq: Ponto;
  pupilaDir: Ponto;
  centro: Ponto;
  /** rotação (roll) do rosto em radianos */
  angulo: number;
  /** px por milímetro, calibrado pelo diâmetro da íris */
  pxPorMm: number;
  dpBinocular: number;
  dpDireita: number;
  dpEsquerda: number;
};

/**
 * Converte landmarks normalizados em geometria óptica em px do canvas
 * (com medidas de DP já em milímetros).
 */
export function calcularGeometria(
  lm: Ponto[],
  largura: number,
  altura: number,
): GeometriaOptica | null {
  const px = (p?: Ponto) => (p ? { x: p.x * largura, y: p.y * altura } : null);
  const pupilaEsq = px(lm[LANDMARKS.irisEsquerda]);
  const pupilaDir = px(lm[LANDMARKS.irisDireita]);
  const bordaEsq = LANDMARKS.irisEsquerdaBorda.map((i) => px(lm[i])).filter(Boolean) as Ponto[];
  const nariz = px(lm[LANDMARKS.baseNariz]);
  if (!pupilaEsq || !pupilaDir || !nariz || bordaEsq.length < 4) return null;

  const irisPx = Math.max(
    distancia(bordaEsq[0]!, bordaEsq[2]!),
    distancia(bordaEsq[1]!, bordaEsq[3]!),
  );
  const pxPorMm = irisPx > 0 ? irisPx / IRIS_MM : 1;

  const dpPx = distancia(pupilaEsq, pupilaDir);
  return {
    pupilaEsq,
    pupilaDir,
    centro: { x: (pupilaEsq.x + pupilaDir.x) / 2, y: (pupilaEsq.y + pupilaDir.y) / 2 },
    angulo: Math.atan2(pupilaDir.y - pupilaEsq.y, pupilaDir.x - pupilaEsq.x),
    pxPorMm,
    dpBinocular: dpPx / pxPorMm,
    dpDireita: distancia(pupilaDir, { x: nariz.x, y: pupilaDir.y }) / pxPorMm,
    dpEsquerda: distancia(pupilaEsq, { x: nariz.x, y: pupilaEsq.y }) / pxPorMm,
  };
}
