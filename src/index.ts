import { config } from 'dotenv-cra';
import { join } from 'path';
import { loadTags } from './lib/util/tags';

process.env.NODE_ENV ??= 'development';

config({
	path: join(__dirname, '..', '.env')
});

void loadTags();

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./server').start();
