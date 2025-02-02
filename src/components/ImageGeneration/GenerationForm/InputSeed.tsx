import { usePrevious } from '@dnd-kit/utilities';
import { Group, Input, InputWrapperProps, SegmentedControl } from '@mantine/core';
import { useEffect, useState } from 'react';
import { NumberInputWrapper } from '~/libs/form/components/NumberInputWrapper';
import { withController } from '~/libs/form/hoc/withController';

const min = 1;
const max = 4294967295;
const maxRandom = max / 2;
type Props = {
  value?: number;
  onChange?: (value?: number) => void;

  disabled?: boolean;
} & Omit<InputWrapperProps, 'children'>;

function SeedInput({ value, onChange, disabled, ...inputWrapperProps }: Props) {
  const [control, setControl] = useState(value ? 'custom' : 'random');

  const previousControl = usePrevious(control);
  useEffect(() => {
    if (value === undefined && previousControl !== 'random') setControl('random');
    else if (value !== undefined && previousControl !== 'custom') setControl('custom');
  }, [value]); //eslint-disable-line

  useEffect(() => {
    if (value !== undefined && control === 'random') onChange?.(undefined);
    else if (value === undefined && control === 'custom')
      onChange?.(Math.floor(Math.random() * maxRandom));
  }, [control]); //eslint-disable-line

  return (
    <Input.Wrapper {...inputWrapperProps}>
      <Group>
        <SegmentedControl
          value={control}
          onChange={setControl}
          data={[
            { label: 'Random', value: 'random' },
            { label: 'Custom', value: 'custom' },
          ]}
          disabled={disabled}
        />
        <NumberInputWrapper
          value={value}
          onChange={onChange}
          placeholder="Random"
          clearable
          min={min}
          max={max}
          sx={{ flex: 1 }}
          hideControls
          format="default"
          disabled={disabled}
        />
      </Group>
    </Input.Wrapper>
  );
}

const InputSeed = withController(SeedInput, ({ field }) => ({
  value: field.value,
}));
export default InputSeed;
