import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";

import AlbumIcon from "@mui/icons-material/Album";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import { Chip, Input, Stack } from "@mui/joy";

import ChipInput from "@/components/common/ChipInput";
import ConfirmModal from "@/components/common/ConfirmModal";
import FormController from "@/components/common/FormController";
import FormValidationMessages from "@/translations/messages/FormValidation";
import { buildRules } from "@/utils/forms";

interface Credits {
  artists: string[];
  title: string;
}

interface GuessCreditsModalProps {
  open?: boolean;
  tokenCost?: number;
  onConfirm?: (credits: Credits) => void;
  onClose?: () => void;
}

const GuessCreditsModal = ({
  open,
  tokenCost,
  onConfirm,
  onClose,
}: GuessCreditsModalProps) => {
  const intl = useIntl();
  const {
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      artists: [],
      title: "",
    },
  });

  const handleConfirm = (credits: Credits) => {
    onClose?.();
    onConfirm?.(credits);
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit(handleConfirm)}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.GuessCreditsModal.header"
          defaultMessage="Guess artists & title"
        />
      }
      canConfirm={isValid}
      tokenCost={tokenCost}
    >
      <form onSubmit={handleSubmit(handleConfirm)}>
        <Stack spacing={2}>
          <FormattedMessage
            id="GameTurnGuessingView.GuessCreditsModal.artists.label"
            defaultMessage="Artists"
          >
            {([label]) => (
              <FormController
                name="artists"
                label={label as string}
                control={control}
                rules={{
                  validate: (v) =>
                    v.length > 0 ||
                    intl.formatMessage(FormValidationMessages.required),
                }}
                render={({ field }) => (
                  <ChipInput
                    {...field}
                    disableClearable
                    variant="soft"
                    startDecorator={<PeopleIcon />}
                    placeholder={label as string}
                    renderTags={(tags, getTagProps) =>
                      tags.map((item, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={index}
                          size="sm"
                          variant="solid"
                          color="primary"
                          endDecorator={<CloseIcon fontSize="small" />}
                        >
                          {item}
                        </Chip>
                      ))
                    }
                  />
                )}
              />
            )}
          </FormattedMessage>
          <FormattedMessage
            id="GameTurnGuessingView.GuessCreditsModal.title.label"
            defaultMessage="Title"
          >
            {([label]) => (
              <FormController
                name="title"
                label={label as string}
                control={control}
                rules={buildRules(intl, { required: true })}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="soft"
                    startDecorator={<AlbumIcon />}
                    placeholder={label as string}
                  />
                )}
              />
            )}
          </FormattedMessage>
        </Stack>

        {/* Workaround to allow submitting the form without a submit button */}
        <input type="submit" hidden />
      </form>
    </ConfirmModal>
  );
};

export default GuessCreditsModal;
