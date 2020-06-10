"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-puppeteer");
describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://localhost:8080');
    });
});
it('should fill out the form ', async () => {
    // let text = await page.evaluate(() => document.body.textContent)
    //   await page.click('button')
    await expect(page).toClick('button');
    //await page.type('#input-94', "HELOOOOOOOO")
    it('should fill out the form ', async () => {
        // let text = await page.evaluate(() => document.body.textContent)
        await expect(page).toClick('button', { text: 'login' });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvdGVzdHMvdW5pdC90ZXN0LnNwZWMudHMiLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBeUI7QUFFekIsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFFcEIsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQzdDLENBQUMsQ0FBQyxDQUFBO0FBR0EsQ0FBQyxDQUFDLENBQUE7QUFFRixFQUFFLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDekMsa0VBQWtFO0lBQ3JFLCtCQUErQjtJQUM1QixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFcEMsNkNBQTZDO0lBR2pELEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN4QyxrRUFBa0U7UUFFakUsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBRTNELENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvdGVzdHMvdW5pdC90ZXN0LnNwZWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdleHBlY3QtcHVwcGV0ZWVyJ1xuXG5kZXNjcmliZSgnR29vZ2xlJywgKCkgPT4ge1xuIFxuICAgIGJlZm9yZUFsbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHBhZ2UuZ290bygnaHR0cHM6Ly9sb2NhbGhvc3Q6ODA4MCcpXG4gICAgfSlcblxuXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIGZpbGwgb3V0IHRoZSBmb3JtICcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gbGV0IHRleHQgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpXG4gICAgIC8vICAgYXdhaXQgcGFnZS5jbGljaygnYnV0dG9uJylcbiAgICAgICAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvQ2xpY2soJ2J1dHRvbicpXG5cbiAgICAgICAgLy9hd2FpdCBwYWdlLnR5cGUoJyNpbnB1dC05NCcsIFwiSEVMT09PT09PT09cIilcblxuXG4gICAgaXQoJ3Nob3VsZCBmaWxsIG91dCB0aGUgZm9ybSAnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgLy8gbGV0IHRleHQgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpXG4gICAgICAgXG4gICAgICAgIGF3YWl0IGV4cGVjdChwYWdlKS50b0NsaWNrKCdidXR0b24nLCB7IHRleHQ6ICdsb2dpbicgfSlcblxuICAgIH0pXG59KVxuXG4iXSwidmVyc2lvbiI6M30=