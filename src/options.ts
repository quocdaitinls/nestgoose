import {ModuleMetadata, Type} from "@nestjs/common";
import {ConnectorOptions} from "./connector";

export interface NestgooseConnectionOptions {
  connectionName?: string;
}

export interface ConnectorOptionsFactory {
  createConnectorOptions(): ConnectorOptions | Promise<ConnectorOptions>;
}

export interface ConnectorOptionsProviderInput {
  useValue?: ConnectorOptions;
  useExisting?: Type<ConnectorOptionsFactory>;
  useClass?: Type<ConnectorOptionsFactory>;
  useFactory?: (...args: any[]) => ConnectorOptions | Promise<ConnectorOptions>;
  inject?: any[];
}

export interface ModuleOptions
  extends ConnectorOptions,
    NestgooseConnectionOptions {}

export interface ModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports">,
    NestgooseConnectionOptions,
    ConnectorOptionsProviderInput {}
