"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-puppeteer");
describe('Google', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080/login');
    });
    it('should fill out the form ', async () => {
        // let text = await page.evaluate(() => document.body.textContent)
        await expect(page).toClick('button', { text: 'login' });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL3Nqb3NoaS90ZXN0L2hlaW1kYWxsLWxpdGUvdGVzdHMvdW5pdC90ZXN0LnNwZWMudHMiLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBeUI7QUFFekIsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFFcEIsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0lBR0YsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3hDLGtFQUFrRTtRQUVqRSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFFM0QsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvc2pvc2hpL3Rlc3QvaGVpbWRhbGwtbGl0ZS90ZXN0cy91bml0L3Rlc3Quc3BlYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2V4cGVjdC1wdXBwZXRlZXInXG5cbmRlc2NyaWJlKCdHb29nbGUnLCAoKSA9PiB7XG4gXG4gICAgYmVmb3JlQWxsKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgcGFnZS5nb3RvKCdodHRwOi8vbG9jYWxob3N0OjgwODAvbG9naW4nKVxuICAgIH0pXG4gXG5cbiAgICBpdCgnc2hvdWxkIGZpbGwgb3V0IHRoZSBmb3JtICcsIGFzeW5jICgpID0+IHtcbiAgICAgICAvLyBsZXQgdGV4dCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudClcbiAgICAgICBcbiAgICAgICAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvQ2xpY2soJ2J1dHRvbicsIHsgdGV4dDogJ2xvZ2luJyB9KVxuXG4gICAgfSlcbn0pIl0sInZlcnNpb24iOjN9