import { config } from 'dotenv-cra';
import { join } from 'path';

process.env.NODE_ENV ??= 'development';

config({
	path: join(__dirname, '..', '.env')
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./server').start();
