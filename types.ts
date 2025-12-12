
export enum Screen {
  LOADING = 'LOADING',
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  EXPORT = 'EXPORT'
}

export interface Project {
  id: string;
  title: string;
  date: string;
  image: string;
  thumbnail: string;
  type: string;
}

export enum ToolType {
  MAGIC = 'AI Magic',
  FLUX = 'Flux Remix',
  CUTOUT = 'Cutout',
  RETOUCH = 'Retouch',
  FILTERS = 'Filters',
  ADJUST = 'Adjust',
  STICKERS = 'Stickers',
  TEXT = 'Text',
  UPSCALE = 'Upscale',
  BG_REMOVE = 'Bg Remove',
  STYLE = 'Style'
}

export interface GenerationConfig {
    aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
    imageSize: "1K" | "2K" | "4K";
}
