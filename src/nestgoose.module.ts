import {DynamicModule, Module} from "@nestjs/common";
import {ModuleAsyncOptions, ModuleOptions} from "./options";
import {createNestgooseProviders} from "./providers";
import {NestgooseCoreModule} from "./nestgoose-core.module";
import {NestgooseModelInput} from "./types";

@Module({})
export class NestgooseModule {
  private static parseForRootArgs(
    arg1: string | ModuleOptions,
    arg2: Omit<ModuleOptions, "uri"> = {}
  ): ModuleOptions {
    if (typeof arg1 === "string")
      return {
        uri: arg1,
        ...arg2,
      };

    return arg1;
  }

  static forRoot(
    uri: string,
    options?: Omit<ModuleOptions, "uri">
  ): DynamicModule;
  static forRoot(options?: ModuleOptions): DynamicModule;
  static forRoot(
    arg1: string | ModuleOptions,
    arg2?: Omit<ModuleOptions, "uri">
  ): DynamicModule {
    const options = this.parseForRootArgs(arg1, arg2);

    return {
      module: NestgooseModule,
      imports: [NestgooseCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    return {
      module: NestgooseModule,
      imports: [NestgooseCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(
    models: NestgooseModelInput[],
    connectionName?: string
  ): DynamicModule {
    const providers = createNestgooseProviders(models, connectionName);

    return {
      module: NestgooseModule,
      providers,
      exports: providers,
    };
  }
}
