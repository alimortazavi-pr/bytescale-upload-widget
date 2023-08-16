import { JSX } from "preact";
import { WidgetBase } from "uploader/components/widgets/widgetBase/WidgetBase";
import { UploadWidgetLayout } from "uploader/config/UploadWidgetLayout";
import { RightSvg } from "uploader/assets/svgs/RightSvg";

interface Props {
  error: Error;
  layout: UploadWidgetLayout;
}

export const ConfigError = ({ error, layout }: Props): JSX.Element => {
  const errorMessage = (error.message ?? "unknown error").replace("[upload-js] ", "");
  const isApiKeyError = errorMessage.toLowerCase().includes("api key");
  return (
    <WidgetBase layout={layout} multi={false}>
      <h1>{isApiKeyError ? "Almost there..." : "Oops!"}</h1>
      <p>{errorMessage}</p>
      {isApiKeyError ? (
        <div className="mt-5">
          <a href="https://www.bytescale.com/get-started" className="btn btn--primary-outline">
            Get API Key <RightSvg width={12} className="ml-2" />
          </a>{" "}
        </div>
      ) : (
        <></>
      )}
    </WidgetBase>
  );
};
