import {Inject} from "@nestjs/common";
import {NestgooseModelClass} from "./types";
import {getConnectionToken, getModelToken} from "./utils";

export const InjectModel = (
  modelClass: NestgooseModelClass,
  connectionName?: string
) => Inject(getModelToken(modelClass.name, connectionName));

export const InjectConnection = (connectionName?: string) =>
  Inject(getConnectionToken(connectionName));
