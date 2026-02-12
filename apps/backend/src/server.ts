import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
});
