import { Show, createMemo } from "solid-js";
import { Trans } from "@lingui-solid/solid/macro";

import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { ScreenShareQualityName } from "@revolt/state/stores/Voice";
import {
  CategoryButton,
  CategorySelectOption,
  Checkbox,
  Column,
  Text,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

export function ScreenShareOptions() {
  const { voice } = useState();
  const voiceContext = useVoice();

  const qualities = createMemo(() => {
    if (!voiceContext) return {};
    return voiceContext.getEnabledScreenShareQualities();
  });

  return (
    <Show when={voiceContext && Object.keys(qualities()).length > 0}>
      <Column>
        <Text class="title">
          <Trans>Screen Share Settings</Trans>
        </Text>
        <CategoryButton.Group>
          <CategoryButton.Select
            icon={<Symbol>screen_share</Symbol>}
            title={<Trans>Select screen share quality</Trans>}
            options={
              Object.fromEntries(
                Object.keys(qualities()).map((name) => [
                  name,
                  {
                    title: qualities()[name as ScreenShareQualityName]!.fullName,
                  },
                ]),
              ) as { [key in ScreenShareQualityName]: CategorySelectOption }
            }
            value={voice.screenShareQuality}
            onUpdate={(ns) => (voice.screenShareQuality = ns)}
          />
          <CategoryButton
            icon="blank"
            action={<Checkbox checked={voice.screenShareQualityAsk} />}
            onClick={() =>
              (voice.screenShareQualityAsk = !voice.screenShareQualityAsk)
            }
          >
            <Trans>Always Ask for Screen Share Quality</Trans>
          </CategoryButton>
        </CategoryButton.Group>
      </Column>
    </Show>
  );
}
