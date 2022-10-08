import {IModelOptions} from "@typegoose/typegoose/lib/types";

export interface NestgooseModelClass {
  new (...args: any[]): any;
}

export type NestgooseModelBase = {
  value: NestgooseModelClass;
  options?: IModelOptions;
};

export type NestgooseModel = NestgooseModelBase;

export type NestgooseDiscriminatorModel = NestgooseModelBase & {
  root: NestgooseModelClass;
  id?: string;
};

export type NestgooseWithDiscriminatorsModel = NestgooseModelBase & {
  discriminators: (
    | NestgooseModelClass
    | NestgooseModel
    | Omit<NestgooseDiscriminatorModel, "root">
  )[];
};

export type NestgooseModelInput =
  | NestgooseModelClass
  | NestgooseModel
  | NestgooseDiscriminatorModel
  | NestgooseWithDiscriminatorsModel;

export type NestgooseModelConverted =
  | NestgooseModel
  | NestgooseDiscriminatorModel;
