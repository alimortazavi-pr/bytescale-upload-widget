import { UploadedFile } from "@bytescale/upload-widget/modules/UploadedFile";

export interface PreprocessingFile {
  file: File;
  fileIndex: number;
  type: "preprocessing";
}

export interface UploadingFile {
  cancel: () => void;
  file: File;
  fileIndex: number;
  progress: number; // Factor (0 to 1)
  type: "uploading";
}

export interface FailedFile {
  error: Error;
  file: File;
  fileIndex: number;
  type: "failed";
}

export interface UploadedFileContainer {
  editedFile: UploadedFile | undefined;
  file: File;
  fileIndex: number;
  isReady: boolean; // False if the file still requires some action performing before it's considered fully uploaded, i.e. editing, or having 'accept' clicked in the preview screen.
  type: "uploaded";
  uploadedFile: UploadedFile;
}

export type PendingFile = PreprocessingFile | UploadingFile;

export type SubmittedFile = PendingFile | UploadedFileContainer | FailedFile;

export function isUploadedFile(file: SubmittedFile): file is UploadedFileContainer {
  return file.type === "uploaded";
}

export function isPendingFile(file: SubmittedFile): file is PendingFile {
  return file.type === "preprocessing" || file.type === "uploading";
}

export function isFailedFile(file: SubmittedFile): file is FailedFile {
  return file.type === "failed";
}

export interface SubmittedFileMap {
  [sparseFileIndex: number]: SubmittedFile | undefined;
}
