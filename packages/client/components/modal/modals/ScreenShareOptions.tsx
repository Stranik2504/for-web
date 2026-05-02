import { Trans } from "@lingui-solid/solid/macro";
import { type IFormControl } from "solid-forms";

import { type ScreenShareQualityName } from "@revolt/state/stores/Voice";
import { Column, Form2 } from "@revolt/ui";

type ScreenShareOption = {
  name: string;
  fullName: string;
};

type ScreenShareOptionsProps = {
  qualityControl: IFormControl<ScreenShareQualityName>;
  audioControl: IFormControl<boolean>;
  qualities: ScreenShareOption[];
};

export function ScreenShareOptions(props: ScreenShareOptionsProps) {
  return (
    <Column>
      <Form2.ButtonGroup
        control={props.qualityControl}
        buttonDefinitions={props.qualities.map((quality) => ({
          children: quality.fullName,
          value: quality.name,
        }))}
      />
      <Form2.Checkbox control={props.audioControl}>
        <Trans>Share audio</Trans>
      </Form2.Checkbox>
    </Column>
  );
}
