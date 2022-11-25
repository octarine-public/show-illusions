import "./Translate"

import { EventsX } from "github.com/octarine-private/immortal-core/index"
import { EventsSDK } from "github.com/octarine-public/wrapper/index"

import { IllusionsManager } from "./Manager/Main"
import { MenuManager } from "./Manager/Menu"

const IMenu = new MenuManager()
const IManager = new IllusionsManager(IMenu)

EventsSDK.on("Draw", () => IManager.OnDraw())

EventsSDK.on("PostDataUpdate", () => IManager.OnPostDataUpdate())

EventsX.on("GameEnded", () => IManager.OnGameEnded())

EventsX.on("VisibilityChanged", unit => IManager.OnVisibilityChanged(unit))

EventsX.on("LifeStateChanged", entity => IManager.OnLifeStateChanged(entity))

EventsX.on("EntityCreated", entity => IManager.OnEntityCreated(entity))

EventsX.on("EntityChanged", entity => IManager.OnEntityChanged(entity))

EventsX.on("EntityDestroyed", entity => IManager.OnEntityDestroyed(entity))
