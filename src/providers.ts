import {Provider} from "@nestjs/common";
import {
  getDiscriminatorModelForClass,
  getModelForClass,
} from "@typegoose/typegoose";
import {Connection, Model} from "mongoose";
import {convert} from "./convert";
import {
  NestgooseModel,
  NestgooseDiscriminatorModel,
  NestgooseModelInput,
} from "./types";
import {
  getConnectionToken,
  getModelToken,
  isNestgooseDiscriminatorModel,
} from "./utils";

export const createRootModelProvider = (
  model: NestgooseModel,
  connectionName?: string
): Provider => {
  const connectionToken = getConnectionToken(connectionName);
  const modelToken = getModelToken(model.value.name, connectionName);

  return {
    provide: modelToken,
    useFactory: (connection: Connection) =>
      getModelForClass(model.value, {
        ...model?.options,
        existingConnection: connection,
      }),
    inject: [connectionToken],
  };
};

export const createDiscriminatorModelProvider = (
  model: NestgooseDiscriminatorModel,
  connectionName?: string
): Provider => {
  const connectionToken = getConnectionToken(connectionName);
  const modelToken = getModelToken(model.value.name, connectionName);
  const rootModelToken = getModelToken(model.root.name, connectionName);

  return {
    provide: modelToken,
    useFactory: (rootModel: Model<any>, connection: Connection) =>
      getDiscriminatorModelForClass(rootModel, model.value, model.id, {
        ...model?.options,
        existingConnection: connection,
      }),
    inject: [rootModelToken, connectionToken],
  };
};

export const createNestgooseProviders = (
  input: NestgooseModelInput[],
  connectionName?: string
): Provider[] => {
  const models = input
    .map((value) => convert(value))
    .reduce((result, pre) => result.concat(pre), []);

  const providers: Provider[] = [];

  for (let model of models) {
    if (isNestgooseDiscriminatorModel(model))
      providers.push(createDiscriminatorModelProvider(model, connectionName));
    else providers.push(createRootModelProvider(model, connectionName));
  }

  return providers;
};
