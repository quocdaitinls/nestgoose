import {Logger} from "@nestjs/common";
import mongoose, {Connection, ConnectOptions} from "mongoose";
import {defer, delay, lastValueFrom, Observable, retryWhen, scan} from "rxjs";

export type ConnectionFactory = (
  connection: Connection,
  connectionName: string
) => Connection;

export interface ConnectorOptions extends ConnectOptions {
  uri: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionFactory?: ConnectionFactory;
}

export class Connector {
  constructor(
    private connectionName: string,
    private options: ConnectorOptions
  ) {}

  connect() {
    const {
      uri,
      retryAttempts,
      retryDelay,
      connectionFactory,
      ...connectOptions
    } = this.options;

    const mongooseConnectionFactory =
      connectionFactory || ((connection) => connection);

    return lastValueFrom(
      defer(async () =>
        mongooseConnectionFactory(
          await mongoose.createConnection(uri, connectOptions).asPromise(),
          this.connectionName
        )
      ).pipe(this.handleRetry(retryAttempts, retryDelay))
    );
  }

  private handleRetry(
    retryAttempts = 9,
    retryDelay = 3000
  ): <T>(source: Observable<T>) => Observable<T> {
    const logger = new Logger("MongooseModule");
    return <T>(source: Observable<T>) =>
      source.pipe(
        retryWhen((e) =>
          e.pipe(
            scan((errorCount, error) => {
              logger.error(
                `Unable to connect to the database. Retrying (${
                  errorCount + 1
                })...`,
                ""
              );
              if (errorCount + 1 >= retryAttempts) {
                throw error;
              }
              return errorCount + 1;
            }, 0),
            delay(retryDelay)
          )
        )
      );
  }
}
