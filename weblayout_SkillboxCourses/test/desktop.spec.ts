import { Browser, launch } from 'puppeteer';
import { setup as setupDevServer, teardown as teardownDevServer } from 'jest-dev-server'
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

const reqPercent = 0.04;

describe('Тестируем верстку на pixelperfect', () => {
	let browser: Browser;
	beforeAll(async () => {
		await setupDevServer({
			command: `${process.cwd()}/node_modules/.bin/static src/. -p 3333`,
			launchTimeout: 50000,
			port: 3333,
		});
		browser = await launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--enable-font-antialiasing',
				'--font-render-hinting=none',
				'--disable-gpu'
			],
		});
	});

	afterAll(async () => {
		await teardownDevServer();
		await browser.close();
	})

	it('desktop visual regression test', async () => {
		const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 3036 })
		await page.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });
		const screenshot = await page.screenshot();
		page.close();

		return expect(screenshot).toMatchImageSnapshot({
			failureThreshold: reqPercent,
			failureThresholdType: 'percent',
		});
	});
})
