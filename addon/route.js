import Ember from 'ember';
import isEqual from 'npm:lodash.isequal';

export default Ember.Route.extend({
	init(){
		this._super(...arguments);
		this.set('isRouteDirty', false);
	},
	setupController(controller, model){
		controller.set('model', model);
		controller.addObserver('isRouteDirty', this, () => {
			controller.set('isRouteDirty', this.get('isRouteDirty'));
		});
	},
	/**
	 * watchModels should be overwritten as an array of property strings in the route
	 * If left blank, the addon will assume to watch the model itself, not a subset of the model
	 * 
	 * To watch the contents of the relationships you can use dot notation.
	 * For example, if you want to watch the dirtyness of all forminstances on a campaign,
	 * the watchModels array would look like this: ['campaign', 'campaign.forminstances']
	 * 
	 * If you want to watch the dirtyness of a a has many array, simply only put the parent model name
	 * For example if you want to know if a supplier was added to a campaign, and do not care about 
	 * the contents of the suppliers, the array would look like this: ['campaign'] 
	 **/ 
	watchModels: null,
	_initialState: [],
	_getModelSnapshot(model){
		// If the model is hash rather than just one item
		if (this.get('watchModels')){
			return this.get('watchModels').map((watchModel) => {

				if (Ember.isArray(Ember.get(model, watchModel))){
					return Ember.get(model, watchModel).map((item) => {

						return item ? item.toJSON() : {};
					});
				}
				return Ember.get(model, watchModel) ? Ember.get(model, watchModel).toJSON() : {};
			});
		}

		// If model is not a hash
		return model.toJSON();
	},
	afterModel(resolvedModel){
		// After every time the model is loaded, reset the initial state
		this.set('_initialState', this._getModelSnapshot(resolvedModel));
		this.set('isRouteDirty', false);
	},
	actions: {
		// This action needs to be called to set the isRouteDirty flag
		// I recommend to call this function when attempting to save and attempting to close
		// ARH - TODO: Put oberservers on the models themselves instead of requiring a call to this function
		checkRouteForDirty(){
			let initialState = this.get('_initialState');
			let currentState = this._getModelSnapshot(this.currentModel);
			
			return this.set('isRouteDirty', !isEqual(initialState, currentState));
			
		}
	}
});