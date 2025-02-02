import cn from "classnames";
import { DashedBackgroundSvg } from "@bytescale/upload-widget/assets/svgs/DashedBackgroundSvg";
import { JSX } from "preact";
import { Rect } from "@bytescale/upload-widget/modules/common/Rect";

interface Props {
  closeButtonSize: number;
  dimensions: Rect | undefined;
  isDragging: boolean;
}

export const WidgetBaseBackground = ({ closeButtonSize, isDragging, dimensions }: Props): JSX.Element => {
  if (dimensions === undefined) {
    return <></>;
  }

  return (
    <DashedBackgroundSvg
      width={dimensions.width}
      height={dimensions.height}
      notchSize={closeButtonSize}
      className={cn("upload-widget__widget-base__modal-bg", {
        "upload-widget__widget-base__modal-bg--dragging": isDragging
      })}
    />
  );
};
