import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { createFormControl, createFormGroup } from "solid-forms";

import { useState } from "@revolt/state";
import { ScreenShareQualityName } from "@revolt/state/stores/Voice";
import { Column, Dialog, DialogProps, Form2, Ripple } from "@revolt/ui";

import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import { styled } from "styled-system/jsx";
import { Modals } from "../types";
import { ScreenShareOptions } from "./ScreenShareOptions";

export function ScreenSharePickerModal(
  props: DialogProps & Modals & { type: "screen_share_picker" },
) {
  const { voice } = useState();
  const { t } = useLingui();
  const [activeTab, setActiveTab] = createSignal<"applications" | "screens">(
    props.sources.some((source) => !source.isFullScreen)
      ? "applications"
      : "screens",
  );

  const group = createFormGroup({
    qualityName: createFormControl<ScreenShareQualityName>(
      voice.screenShareQuality || "low",
    ),
    audio: createFormControl(voice.screenShareAudio),
    idx: createFormControl([0]),
  });

  async function onSubmit() {
    if (currentSources().length === 0) return;

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

  createEffect(() => {
    const sources = currentSources();
    const selected = group.controls.idx.value[0];

    if (
      sources.length > 0 &&
      !sources.some((source) => source.value === selected)
    ) {
      group.controls.idx.setValue([sources[0].value]);
    }
  });

  return (
    <Dialog
      minWidth={760}
      maxWidth={920}
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
          isDisabled: currentSources().length === 0,
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
          <Show
            when={currentSources().length > 0}
            fallback={<EmptyState>{t`No sources found for this tab`}</EmptyState>}
          >
            <SourcesGrid>
              <For each={currentSources()}>
                {(source) => {
                  return (
                    <SourceTile
                      type="button"
                      selected={group.controls.idx.value[0] === source.value}
                      onClick={() => group.controls.idx.setValue([source.value])}
                    >
                      <Ripple />
                      <SourceVisual>
                        <Show
                          when={source.item.image}
                          fallback={
                            <SourceScreenGlyph>
                              <div />
                            </SourceScreenGlyph>
                          }
                        >
                          {(image) => (
                            <SourceIcon src={image()} alt={source.item.name} />
                          )}
                        </Show>
                      </SourceVisual>
                      <SourceMeta>
                        <SourceKind>
                          {source.item.isFullScreen ? t`Screen` : t`Application`}
                        </SourceKind>
                        <SourceName>{source.item.name}</SourceName>
                      </SourceMeta>
                    </SourceTile>
                  );
                }}
              </For>
            </SourcesGrid>
          </Show>
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
    gap: "var(--gap-sm)",
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
    borderRadius: "var(--borderRadius-sm) var(--borderRadius-sm) 0 0",

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

const SourcesGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "var(--gap-md)",
    marginBottom: "var(--gap-md)",
  },
});

const SourceTile = styled("button", {
  base: {
    minHeight: "160px",
    width: "100%",
    border: "1px solid var(--md-sys-color-outline)",
    borderRadius: "var(--borderRadius-md)",
    background: "var(--md-sys-color-surface-dim)",
    padding: "var(--gap-md)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: "var(--gap-sm)",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",

    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },

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

const SourceVisual = styled("div", {
  base: {
    minHeight: "84px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const SourceIcon = styled("img", {
  base: {
    width: "64px",
    height: "64px",
    borderRadius: "var(--borderRadius-sm)",
    objectFit: "cover",
    boxShadow: "var(--shadows-sm)",
  },
});

const SourceScreenGlyph = styled("div", {
  base: {
    width: "72px",
    height: "52px",
    borderRadius: "10px",
    border: "2px solid currentColor",
    display: "grid",
    placeItems: "center",

    "& > div": {
      width: "34px",
      height: "22px",
      borderRadius: "6px",
      border: "2px solid currentColor",
    },
  },
});

const SourceMeta = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const SourceKind = styled("span", {
  base: {
    fontSize: "0.78rem",
    opacity: 0.75,
  },
});

const SourceName = styled("span", {
  base: {
    fontSize: "0.95rem",
    fontWeight: "600",
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const EmptyState = styled("div", {
  base: {
    padding: "var(--gap-lg)",
    borderRadius: "var(--borderRadius-md)",
    border: "1px dashed var(--md-sys-color-outline)",
    color: "var(--md-sys-color-on-surface-variant)",
    textAlign: "center",
  },
});

