"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-puppeteer");
describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://github.com/login');
    });
});
it('should fill out the form ', async () => {
    // let text = await page.evaluate(() => document.body.textContent)
    await page.type('#login_field', "HIIII");
    await page.type('#password', "hello");
    //await page.type('#input-94', "HELOOOOOOOO")
    it('should fill out the form ', async () => {
        // let text = await page.evaluate(() => document.body.textContent)
        await expect(page).toClick('button', { text: 'login' });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvdGVzdHMvdW5pdC90ZXN0LnNwZWMudHMiLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBeUI7QUFFekIsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFFcEIsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBQy9DLENBQUMsQ0FBQyxDQUFBO0FBR0EsQ0FBQyxDQUFDLENBQUE7QUFFRixFQUFFLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDekMsa0VBQWtFO0lBQ2xFLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDeEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNyQyw2Q0FBNkM7SUFHakQsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3hDLGtFQUFrRTtRQUVqRSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFFM0QsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvc2pvc2hpL3Rlc3QvaGVpbWRhbGwtbGl0ZS90ZXN0cy91bml0L3Rlc3Quc3BlYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2V4cGVjdC1wdXBwZXRlZXInXG5cbmRlc2NyaWJlKCdHb29nbGUnLCAoKSA9PiB7XG4gXG4gICAgYmVmb3JlQWxsKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgcGFnZS5nb3RvKCdodHRwczovL2dpdGh1Yi5jb20vbG9naW4nKVxuICAgIH0pXG5cblxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCBmaWxsIG91dCB0aGUgZm9ybSAnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIGxldCB0ZXh0ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KVxuICAgICAgICBhd2FpdCBwYWdlLnR5cGUoJyNsb2dpbl9maWVsZCcsIFwiSElJSUlcIilcbiAgICAgICAgYXdhaXQgcGFnZS50eXBlKCcjcGFzc3dvcmQnLCBcImhlbGxvXCIpXG4gICAgICAgIC8vYXdhaXQgcGFnZS50eXBlKCcjaW5wdXQtOTQnLCBcIkhFTE9PT09PT09PXCIpXG5cblxuICAgIGl0KCdzaG91bGQgZmlsbCBvdXQgdGhlIGZvcm0gJywgYXN5bmMgKCkgPT4ge1xuICAgICAgIC8vIGxldCB0ZXh0ID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KVxuICAgICAgIFxuICAgICAgICBhd2FpdCBleHBlY3QocGFnZSkudG9DbGljaygnYnV0dG9uJywgeyB0ZXh0OiAnbG9naW4nIH0pXG5cbiAgICB9KVxufSlcblxuIl0sInZlcnNpb24iOjN9