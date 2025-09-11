import { Telegraf } from 'telegraf';
import help from './help';
import wallet from './wallet';
import trade from './trade';
import lendBorrow from './lendBorrow';
import history from './history';

export function registerCommands(bot: Telegraf) {
  help(bot);
  wallet(bot);
  trade(bot);
  lendBorrow(bot);
  history(bot);
}


