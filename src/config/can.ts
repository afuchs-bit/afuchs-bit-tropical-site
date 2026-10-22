/**
 * Can presets. Scene unit: 1 = 100 mm. Which one we use follows from the
 * label design the partners upload (its aspect ratio tells standard vs sleek).
 */
export type CanPresetId = "standard" | "sleek";

export type CanPreset = {
  id: CanPresetId;
  /** Body radius and total height in scene units. */
  radius: number;
  height: number;
  /** Printable cylinder: vertical start and height in scene units. */
  labelY: number;
  labelHeight: number;
  /** Label texture size we deliver (WebP) and the master size we ask for. */
  labelPx: [number, number];
  labelMasterPx: [number, number];
};

export const canPresets: Record<CanPresetId, CanPreset> = {
  standard: {
    id: "standard",
    radius: 0.331,
    height: 1.15,
    labelY: 0.05,
    labelHeight: 0.99,
    labelPx: [2048, 976],
    labelMasterPx: [4096, 1952],
  },
  sleek: {
    id: "sleek",
    radius: 0.29,
    height: 1.46,
    labelY: 0.1,
    labelHeight: 1.24,
    labelPx: [2048, 1394],
    labelMasterPx: [4096, 2787],
  },
};

/** Switch after the label upload. */
export const activeCan: CanPresetId = "sleek";
