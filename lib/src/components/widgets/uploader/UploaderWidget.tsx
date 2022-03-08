/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { JSX } from "preact";
import { Upload, UploadedFile } from "upload-js";
import { UploaderParamsRequired } from "uploader/UploaderParams";
import { useEffect, useState } from "preact/compat";
import { isDefined } from "uploader/common/TypeUtils";
import { UploaderWelcomeScreen } from "uploader/components/widgets/uploader/screens/UploaderWelcomeScreen";
import { UploaderMainScreen } from "uploader/components/widgets/uploader/screens/UploaderMainScreen";
import {
  ErroneousFile,
  isUploadedFile,
  SubmittedFile,
  SubmittedFileMap,
  UploadedFileContainer,
  UploadingFile
} from "uploader/components/widgets/uploader/model/SubmittedFile";
import { WidgetBase } from "uploader/components/widgets/widgetBase/WidgetBase";
import { useDragDrop } from "uploader/common/UseDragDrop";
import "./UploaderWidget.scss";
import { humanFileSize } from "uploader/common/FormatUtils";
import {
  progressWheelDelay,
  progressWheelVanish
} from "uploader/components/widgets/uploader/components/fileIcons/ProgressIcon";
import { UploaderResult } from "uploader/components/modal/UploaderResult";

interface Props {
  params: UploaderParamsRequired;
  reject: (error: Error) => void;
  resolve: (files: UploaderResult[]) => void;
  upload: Upload;
}

export const UploaderWidget = ({ resolve, params, upload }: Props): JSX.Element => {
  const [, setNextSparseFileIndex] = useState<number>(0);
  const [isInitialUpdate, setIsInitialUpdate] = useState(true);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFileMap>({});
  const submittedFileList: SubmittedFile[] = Object.values(submittedFiles).filter(isDefined);
  const uploadedFiles = submittedFileList.filter(isUploadedFile);
  const { multi, tags } = params;
  const finalize = (): void => {
    resolve(uploadedFiles.map(x => UploaderResult.from(x.uploadedFile)));
  };

  useEffect(
    () => {
      if (isInitialUpdate) {
        setIsInitialUpdate(false);
        return;
      }

      const files = uploadedFiles.map(x => UploaderResult.from(x.uploadedFile));
      params.onUpdate(files);

      // For inline layouts, if in single-file mode, we never resolve (there is no terminal state): we just allow the
      // user to add/remove their file, and the caller should instead rely on the 'onUpdate' method above.
      if (!multi && uploadedFiles.length > 0 && !params.showFinishButton && params.layout === "modal") {
        // Just in case the user dragged-and-dropped multiple files.
        const firstUploadedFile = files.slice(0, 1);

        setTimeout(() => {
          resolve(firstUploadedFile);
        }, progressWheelDelay + (progressWheelVanish - 100)); // Allow the animation to finish before closing modal. We add some time to allow the wheel to fade out.
      }
    },
    uploadedFiles.map(x => x.uploadedFile.fileUrl)
  );

  const removeSubmittedFile = (fileIndex: number): void => {
    setSubmittedFiles(
      (x): SubmittedFileMap => {
        const { [fileIndex]: removed, ...rest } = x;
        if (removed?.type === "uploading") {
          removed.cancel();
        }
        return rest;
      }
    );
  };

  const setSubmittedFile = (fileIndex: number, file: SubmittedFile): void => {
    setSubmittedFiles(
      (x): SubmittedFileMap => ({
        ...x,
        [fileIndex]: file
      })
    );
  };

  const updateUploadingFile = (fileIndex: number, file: (uploadingFile: UploadingFile) => SubmittedFile): void => {
    setSubmittedFiles(
      (x): SubmittedFileMap => {
        const oldFile = x[fileIndex];
        if (oldFile === undefined || oldFile.type !== "uploading") {
          return x;
        }

        return {
          ...x,
          [fileIndex]: file(oldFile)
        };
      }
    );
  };

  const doUpload = async (file: File, fileIndex: number): Promise<UploadedFile> => {
    const raiseError = (error: Error): never => {
      setSubmittedFile(fileIndex, {
        file,
        fileIndex,
        error,
        type: "error"
      });

      throw error;
    };

    const { maxFileSizeBytes, mimeTypes } = params;
    if (maxFileSizeBytes !== undefined && file.size > maxFileSizeBytes) {
      raiseError(new Error(`${params.locale.maxSize} ${humanFileSize(maxFileSizeBytes)}`));
    }
    if (mimeTypes !== undefined && !mimeTypes.includes(file.type)) {
      raiseError(new Error(params.locale.unsupportedFileType));
    }

    return await upload.uploadFile({
      file,
      tags,
      onBegin: ({ cancel }) =>
        setSubmittedFile(fileIndex, {
          file,
          fileIndex,
          cancel,
          progress: 0,
          type: "uploading"
        }),
      onProgress: ({ bytesSent, bytesTotal }) =>
        updateUploadingFile(
          fileIndex,
          (uploadingFile): UploadingFile => ({
            ...uploadingFile,
            progress: bytesSent / bytesTotal
          })
        )
    });
  };

  const addFiles = (files: File[]): void =>
    setNextSparseFileIndex(nextSparseFileIndex => {
      // Ignores subsequent drag-and-drop events for single file uploaders.
      if (!multi && submittedFileList.length > 0) {
        return nextSparseFileIndex;
      }

      files.slice(0, multi ? files.length : 1).forEach((file, i) => {
        const fileIndex = nextSparseFileIndex + i;
        doUpload(file, fileIndex).then(
          uploadedFile => {
            updateUploadingFile(
              fileIndex,
              (): UploadedFileContainer => ({
                fileIndex,
                uploadedFile,
                type: "uploaded"
              })
            );
          },
          error => {
            updateUploadingFile(
              fileIndex,
              (uploadingFile): ErroneousFile => ({
                fileIndex,
                error,
                file: uploadingFile.file,
                type: "error"
              })
            );
          }
        );
      });
      return nextSparseFileIndex + files.length;
    });

  const { isDragging, ...rootProps } = useDragDrop(addFiles);

  return (
    <WidgetBase
      htmlProps={rootProps}
      isDraggable={true}
      isDragging={isDragging}
      layout={params.layout}
      multi={params.multi}>
      {submittedFileList.length === 0 ? (
        <UploaderWelcomeScreen params={params} addFiles={addFiles} />
      ) : (
        <UploaderMainScreen
          params={params}
          addFiles={addFiles}
          submittedFiles={submittedFileList}
          uploadedFiles={uploadedFiles}
          remove={removeSubmittedFile}
          finalize={finalize}
        />
      )}
    </WidgetBase>
  );
};
