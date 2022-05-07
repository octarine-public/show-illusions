import { EventsX } from "immortal-core/Imports"
import { EventsSDK } from "wrapper/Imports"
import IllusionsManager from "./Manager/Main"
import MenuManager from "./Manager/Menu"

const IMenu = new MenuManager()
const IManager = new IllusionsManager(IMenu)

EventsSDK.on("Draw", () =>
	IManager.OnDraw())

EventsSDK.on("PostDataUpdate", () =>
	IManager.OnPostDataUpdate())

EventsX.on("GameEnded", () =>
	IManager.OnGameEnded())

EventsX.on("VisibilityChanged", unit =>
	IManager.OnVisibilityChanged(unit))

EventsX.on("LifeStateChanged", entity =>
	IManager.OnLifeStateChanged(entity))

EventsX.on("EntityCreated", entity =>
	IManager.OnEntityCreated(entity))

EventsX.on("EntityChanged", entity =>
	IManager.OnEntityChanged(entity))

EventsX.on("EntityDestroyed", entity =>
	IManager.OnEntityDestroyed(entity))
