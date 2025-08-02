import bodyParser from "./bodyParser.js"
import bruteForce from "./bruteForce.js"

class Middlewares {
	static bodyParser = bodyParser
	static bruteForce = bruteForce
}

export {
	bodyParser,
	bruteForce
}

export default Middlewares
