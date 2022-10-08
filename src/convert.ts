import {
  NestgooseDiscriminatorModel,
  NestgooseModel,
  NestgooseModelClass,
  NestgooseModelConverted,
  NestgooseModelInput,
  NestgooseWithDiscriminatorsModel,
} from "./types";
import {
  isNestgooseDiscriminatorModel,
  isNestgooseModelClass,
  isNestgooseWithDiscriminatorModel,
} from "./utils";

export const convertClass = (value: NestgooseModelClass): NestgooseModel => ({
  value,
});

export const convertDiscriminatorModel = (
  model: NestgooseDiscriminatorModel
): NestgooseModelConverted[] => [convertClass(model.root), model];

export const convertWithDiscriminatorModel = (
  model: NestgooseWithDiscriminatorsModel
): NestgooseModelConverted[] => [
  convertClass(model.value),
  ...model.discriminators.map(
    (discriminator): NestgooseDiscriminatorModel => ({
      root: model.value,
      ...(isNestgooseModelClass(discriminator)
        ? convertClass(discriminator)
        : discriminator),
    })
  ),
];

export const convert = (
  input: NestgooseModelInput
): NestgooseModelConverted[] => {
  const result: NestgooseModelConverted[] = [];

  if (isNestgooseModelClass(input)) return result.concat(convertClass(input));

  if (isNestgooseDiscriminatorModel(input))
    return result.concat(convertDiscriminatorModel(input));

  if (isNestgooseWithDiscriminatorModel(input))
    return result.concat(convertWithDiscriminatorModel(input));

  return result.concat(input);
};
