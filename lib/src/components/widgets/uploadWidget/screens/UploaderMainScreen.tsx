import { JSX } from "preact";
import {
  SubmittedFile,
  UploadedFileContainer
} from "@bytescale/upload-widget/components/widgets/uploadWidget/model/SubmittedFile";
import { SubmittedFileComponent } from "@bytescale/upload-widget/components/widgets/uploadWidget/components/files/SubmittedFileComponent";
import { UploadWidgetConfigRequired } from "@bytescale/upload-widget/config/UploadWidgetConfig";
import cn from "classnames";
import "./UploaderMainScreen.scss";
import { UploadButton } from "@bytescale/upload-widget/components/widgets/uploadWidget/components/UploadButton";
import { RightSvg } from "@bytescale/upload-widget/assets/svgs/RightSvg";

interface Props {
  addFiles: (files: File[]) => void;
  finalize: () => void;
  isImageUploader: boolean;
  options: UploadWidgetConfigRequired;
  remove: (fileIndex: number) => void;
  submittedFiles: SubmittedFile[];
  uploadedFiles: UploadedFileContainer[];
}

export const UploaderMainScreen = ({
  addFiles,
  submittedFiles,
  uploadedFiles,
  options,
  remove,
  finalize,
  isImageUploader
}: Props): JSX.Element => {
  const finishedUploading = submittedFiles.every(x => x.type !== "uploading");
  const canFinish = finishedUploading && uploadedFiles.length > 0;
  const { locale } = options;
  const hasButtons = options.multi || options.showFinishButton;

  return (
    // Div required to break-out of flex-box layout.
    <div className="upload-widget__main-screen">
      <div className="upload-widget__main-screen__file-list">
        <div className="upload-widget__main-screen__file-list__inner">
          {submittedFiles.map(file => (
            <SubmittedFileComponent
              file={file}
              fileCount={submittedFiles.length}
              locale={locale}
              key={file.fileIndex}
              remove={() => remove(file.fileIndex)}
              showRemoveButton={options.showRemoveButton}
            />
          ))}
        </div>
      </div>
      {hasButtons && (
        <div className="upload-widget__controls">
          {options.multi &&
            (options.maxFileCount === undefined || submittedFiles.length < options.maxFileCount ? (
              <UploadButton
                options={options}
                text={isImageUploader ? locale.addAnotherImage : locale.addAnotherFile}
                onUpload={addFiles}
              />
            ) : (
              <div className="upload-widget__main-screen__info">
                {isImageUploader ? locale.maxImagesReached : locale.maxFilesReached} {options.maxFileCount}
              </div>
            ))}

          {options.showFinishButton && (
            <a
              href="#done"
              className={cn("btn btn--primary", { disabled: !canFinish })}
              onClick={e => {
                e.preventDefault();
                if (canFinish) {
                  finalize();
                }
              }}>
              {finishedUploading ? (
                <span className="vcenter hcenter">
                  {locale.finish} {locale.finishIcon && <RightSvg width={12} className="ml-2" />}
                </span>
              ) : (
                locale.pleaseWait
              )}
            </a>
          )}
        </div>
      )}
    </div>
  );
};
