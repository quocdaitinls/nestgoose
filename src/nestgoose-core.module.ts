import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
} from "@nestjs/common";
import {ModuleRef} from "@nestjs/core";
import {deleteModel} from "@typegoose/typegoose";
import {models} from "@typegoose/typegoose/lib/internal/data";
import {Connector, ConnectorOptions} from "./connector";
import {
  NESTGOOSE_CONNECTOR,
  NESTGOOSE_CONNECTOR_OPTIONS,
  NESTGOOSE_CONNECTION_NAME,
} from "./constants";
import {
  ConnectorOptionsFactory,
  ConnectorOptionsProviderInput,
  ModuleAsyncOptions,
  ModuleOptions,
} from "./options";
import {getConnectionToken} from "./utils";

@Global()
@Module({})
export class NestgooseCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(NESTGOOSE_CONNECTION_NAME) private readonly connectionName: string,
    private readonly moduleRef: ModuleRef
  ) {}

  static forRoot(options: ModuleOptions): DynamicModule {
    const {connectionName, ...connectorOptions} = options;

    const providers = this.buildProviders(
      {useValue: connectorOptions},
      connectionName
    );

    return {
      module: NestgooseCoreModule,
      providers,
      exports: [getConnectionToken(connectionName)],
    };
  }

  static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const {connectionName, imports, ...connectorOptionsProviderInput} = options;

    const providers = this.buildProviders(
      connectorOptionsProviderInput,
      connectionName
    );

    return {
      module: NestgooseCoreModule,
      imports,
      providers,
      exports: [getConnectionToken(connectionName)],
    };
  }

  private static buildProviders(
    connectorOptionsProviderInput: ConnectorOptionsProviderInput,
    connectionName?: string
  ): Provider[] {
    const connectionNameProvider =
      this.buildConnectionNameProvider(connectionName);

    const connectorOptionsProviders = this.buildConnectorOptionsProviders(
      connectorOptionsProviderInput
    );

    const connectorProvider = this.buildConnectorProvider();

    const connectionProvider = this.buildConnectionProvider(connectionName);

    return [
      connectionNameProvider,
      ...connectorOptionsProviders,
      connectorProvider,
      connectionProvider,
    ];
  }

  private static buildConnectionNameProvider(
    connectionName?: string
  ): Provider {
    return {
      provide: NESTGOOSE_CONNECTION_NAME,
      useValue: getConnectionToken(connectionName),
    };
  }

  private static buildConnectorOptionsProviders(
    input: ConnectorOptionsProviderInput
  ): Provider[] {
    const {useValue, useClass, useFactory, useExisting, inject} = input;
    const providers: Provider[] = [];

    let connectorOptionsProvider: Provider = null;

    if (useValue) {
      connectorOptionsProvider = {
        provide: NESTGOOSE_CONNECTOR_OPTIONS,
        useValue,
      };
    }

    if (useFactory) {
      connectorOptionsProvider = {
        provide: NESTGOOSE_CONNECTOR_OPTIONS,
        useFactory,
        inject: inject || [],
      };
    }

    if (useClass || useExisting) {
      connectorOptionsProvider = {
        provide: NESTGOOSE_CONNECTOR_OPTIONS,
        useFactory: async (optionsFactory: ConnectorOptionsFactory) =>
          await optionsFactory.createConnectorOptions(),
        inject: [useClass || useExisting],
      };

      if (useClass)
        providers.push({
          provide: useClass,
          useClass,
        });
    }

    providers.push(connectorOptionsProvider);

    return providers;
  }

  private static buildConnectorProvider(): Provider {
    return {
      provide: NESTGOOSE_CONNECTOR,
      useFactory: (
        connectionName: string,
        connectorOptions: ConnectorOptions
      ) => new Connector(connectionName, connectorOptions),
      inject: [NESTGOOSE_CONNECTION_NAME, NESTGOOSE_CONNECTOR_OPTIONS],
    };
  }

  private static buildConnectionProvider(connectionName?: string): Provider {
    return {
      provide: getConnectionToken(connectionName),
      useFactory: async (connector: Connector) => await connector.connect(),
      inject: [NESTGOOSE_CONNECTOR],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<any>(this.connectionName);

    if (connection) {
      await connection.close();
      [...models.entries()]
        .reduce((array, [key, model]) => {
          if (model.db === connection) {
            array.push(key);
          }
          return array;
        }, [])
        .forEach(deleteModel);
    }
  }
}
