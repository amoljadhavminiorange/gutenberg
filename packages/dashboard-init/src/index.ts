/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { registerDashboardFieldTypes } from './field-types';

/**
 * Prepares the dashboard page before it renders: registers the page's
 * field types and the widget-modules discovery entity, so the stage's
 * `getEntityRecords` read resolves and feeds the records to
 * `useWidgetTypes`.
 *
 * This function is mandatory - all init modules must export 'init'.
 */
export async function init() {
	registerDashboardFieldTypes();

	if ( select( coreStore ).getEntityConfig( 'root', 'widgetModule' ) ) {
		return;
	}

	dispatch( coreStore ).addEntities( [
		{
			name: 'widgetModule',
			kind: 'root',
			key: 'name',
			baseURL: '/wp/v2/widget-modules',
			plural: 'widgetModules',
			label: __( 'Widget modules' ),
			supportsPagination: false,
		},
	] );
}
