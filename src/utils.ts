import isClass from "is-class";
import {DEFAULT_DB_CONNECTION} from "./constants";
import {
  NestgooseDiscriminatorModel,
  NestgooseModel,
  NestgooseModelClass,
  NestgooseWithDiscriminatorsModel,
} from "./types";

export const isDefaultConnection = (name?: string) =>
  name === DEFAULT_DB_CONNECTION;

export const getConnectionToken = (connectionName?: string) =>
  connectionName
    ? isDefaultConnection(connectionName)
      ? connectionName
      : `${connectionName}Connection`
    : DEFAULT_DB_CONNECTION;

export const getModelToken = (model: string, connectionName?: string) => {
  if (connectionName === undefined) return `${model}Model`;
  return `${getConnectionToken(connectionName)}__${model}Model`;
};

export const isNestgooseModelClass = (
  input: any
): input is NestgooseModelClass => isClass(input);

export const isNestgooseModel = (input: any): input is NestgooseModel =>
  isNestgooseModelClass(input.value);

export const isNestgooseDiscriminatorModel = (
  input: any
): input is NestgooseDiscriminatorModel =>
  isNestgooseModelClass(input.root) && isNestgooseModelClass(input.value);

export const isNestgooseWithDiscriminatorModel = (
  input: any
): input is NestgooseWithDiscriminatorsModel =>
  isNestgooseModelClass(input.value) && Boolean(input.discriminators);
