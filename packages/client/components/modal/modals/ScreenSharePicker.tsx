import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { createFormControl, createFormGroup } from "solid-forms";

import { useState } from "@revolt/state";
import { ScreenShareQualityName } from "@revolt/state/stores/Voice";
import { Column, Dialog, DialogProps, Form2, Ripple } from "@revolt/ui";

import { createMemo, createSignal } from "solid-js";
import { styled } from "styled-system/jsx";
import { Modals } from "../types";
import { ScreenShareOptions } from "./ScreenShareOptions";

export function ScreenSharePickerModal(
  props: DialogProps & Modals & { type: "screen_share_picker" },
) {
  const { voice } = useState();
  const { t } = useLingui();
  const [activeTab, setActiveTab] = createSignal<"applications" | "screens">(
    "applications",
  );

  const group = createFormGroup({
    qualityName: createFormControl<ScreenShareQualityName>(
      voice.screenShareQuality || "low",
    ),
    audio: createFormControl(voice.screenShareAudio),
    idx: createFormControl([0]),
  });

  async function onSubmit() {
    props.callback(
      group.controls.idx.value[0],
      group.controls.qualityName.value,
      group.controls.audio.value,
    );
    props.onClose();
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  const applications = createMemo(() =>
    props.sources
      .filter((source) => !source.isFullScreen)
      .map((source) => {
        return { item: source, value: source.idx };
      }),
  );

  const screens = createMemo(() =>
    props.sources
      .filter((source) => source.isFullScreen)
      .map((source) => {
        return { item: source, value: source.idx };
      }),
  );

  const currentSources = createMemo(() =>
    activeTab() === "applications" ? applications() : screens(),
  );

  return (
    <Dialog
      minWidth={420}
      show={props.show}
      onClose={() => {
        props.onCancel();
        props.onClose();
      }}
      title={t`Pick a Screen to Share`}
      actions={[
        { text: <Trans>Cancel</Trans> },
        {
          text: <Trans>Go</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
        },
      ]}
    >
      <form onSubmit={submit}>
        <Column>
          <TabsContainer>
            <Tab
              active={activeTab() === "applications"}
              onClick={() => setActiveTab("applications")}
            >
              {t`Applications`}
            </Tab>
            <Tab
              active={activeTab() === "screens"}
              onClick={() => setActiveTab("screens")}
            >
              {t`Screens`}
            </Tab>
          </TabsContainer>
          <PreviewGrid>
            <Form2.VirtualSelect
              control={group.controls.idx}
              items={currentSources()}
              selectHeight="max(40vh, 300px)"
              isMaxHeight={true}
              itemHeight={120}
            >
              {(val, selected) => (
                <PreviewItem selected={selected}>
                  <Ripple />
                  {val.image ? (
                    <PreviewImage src={val.image} alt={val.name} />
                  ) : (
                    <PreviewImagePlaceholder>
                      {val.name.charAt(0).toUpperCase()}
                    </PreviewImagePlaceholder>
                  )}
                  <PreviewLabel>{val.name}</PreviewLabel>
                </PreviewItem>
              )}
            </Form2.VirtualSelect>
          </PreviewGrid>
          <ScreenShareOptions
            qualityControl={group.controls.qualityName}
            audioControl={group.controls.audio}
            qualities={props.qualities}
          />
        </Column>
      </form>
    </Dialog>
  );
}

const TabsContainer = styled("div", {
  base: {
    display: "flex",
    gap: "var(--gap-md)",
    marginBottom: "var(--gap-md)",
    borderBottom: "1px solid var(--md-sys-color-outline)",
  },
});

const Tab = styled("button", {
  base: {
    flex: "1",
    padding: "var(--gap-md) var(--gap-lg)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    color: "var(--md-sys-color-on-surface-variant)",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s ease",
    textDecoration: "none",
    width: "100%",
    textAlign: "center",

    "&:hover": {
      color: "var(--md-sys-color-on-surface)",
    },
  },
  variants: {
    active: {
      true: {
        color: "var(--md-sys-color-primary)",
        borderBottomColor: "var(--md-sys-color-primary)",
      },
    },
  },
});

const PreviewGrid = styled("div", {
  base: {
    marginBottom: "var(--gap-md)",
  },
});

const PreviewItem = styled("div", {
  base: {
    height: "120px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",
    borderRadius: "var(--borderRadius-md)",
    border: "1px solid var(--md-sys-color-outline)",
    background: "var(--md-sys-color-surface-dim)",
    transition: "all 0.2s ease",

    "&:hover": {
      borderColor: "var(--md-sys-color-primary)",
    },
  },
  variants: {
    selected: {
      true: {
        background: "var(--md-sys-color-primary)",
        borderColor: "var(--md-sys-color-primary)",
        color: "var(--md-sys-color-on-primary)",
      },
    },
  },
});

const PreviewImage = styled("img", {
  base: {
    width: "60px",
    height: "60px",
    borderRadius: "var(--borderRadius-sm)",
    objectFit: "cover",
  },
});

const PreviewImagePlaceholder = styled("div", {
  base: {
    width: "60px",
    height: "60px",
    borderRadius: "var(--borderRadius-sm)",
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
});

const PreviewLabel = styled("span", {
  base: {
    fontSize: "0.9rem",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
