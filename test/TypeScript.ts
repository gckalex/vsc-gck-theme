import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message, ColorResolvable } from 'discord.js';
import mongoose from "mongoose";
import { GuildsProvider, PlayersProvider } from '../structures/providers';
import { Logger } from '../util/Logger';
import { join } from 'path';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler,
    listenerHandler: ListenerHandler,
    config: AkairoBotOptions,
    colorConstants: ColorConstants,
    idConstants: IdConstants,
    guildSettings: GuildsProvider,
    player: PlayersProvider,
    logger: typeof Logger,
  }
}

interface AkairoBotOptions {
  owner?: string,
  token?: string
}

interface IdConstants {
  mainModLog: string
}

interface ColorConstants {
  errorColor: ColorResolvable,
  warnColor: ColorResolvable,
  succeedColor: ColorResolvable,
  infoColor: ColorResolvable,
  otherColor: ColorResolvable
}

export default class AkairoBotClient extends AkairoClient {
  public guildSettings: GuildsProvider;

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix: async(message: Message): Promise<string> => {
      const _ = await this.guildSettings.get(message.guild!);
      if (_) return _.prefix;
      // @ts-ignore
      return process.env.prefix;
    },
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 3e3,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: any, str: string): string => `${str}\nType \`cancel\` to cancel the command.`,
        modifyRetry: (_: any, str: string): string => `${str}\nType \`cancel\` to cancel the command.`,
        timeout: 'Error: Command timed out.',
        ended: 'Error: Too many attempts.',
        cancel: 'Command has been cancelled.',
        retries: 3,
        time: 3e4
      },
      otherwise: '',
    }
  });

  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners')
  });

  public player : PlayersProvider;
  public config: AkairoBotOptions;
  public logger: typeof Logger;
  public colorConstants: ColorConstants;
  public idConstants : IdConstants;

  public constructor(config: AkairoBotOptions) {
    super({ ownerID: config.owner }, {
      fetchAllMembers: true,
      messageCacheMaxSize: 10e3,
      messageCacheLifetime: 3600,
    });

    this.config = config;
    this.logger = Logger;
    this.guildSettings = new GuildsProvider();
    this.player = new PlayersProvider();
    this.colorConstants = {
      errorColor: 'RED',
      warnColor: 'ORANGE',
      succeedColor: 'GREEN',
      infoColor: 'NAVY',
      otherColor: 'PURPLE'
    };
    this.idConstants = {
      mainModLog: '820374615427383347'
    };
  }

  private async _init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler
    });

    this.commandHandler.loadAll();
    this.logger.log(`Commands -> ${this.commandHandler.modules.size}`);
    this.listenerHandler.loadAll();
    this.logger.log(`Listeners -> ${this.listenerHandler.modules.size}`);
  }

  public async start(): Promise<string> {
    try {
      await mongoose.connect(process.env.mongostring as string, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }); this.logger.log("Mongoose connected!");
    } catch(e) {
      this.logger.error('DB not connected!');
      this.logger.error(e);
      return process.exit();
    }

    await this._init();
    return this.login(this.config.token);
  }
}

