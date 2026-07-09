import { Menu as _Menu } from '@base-ui/react/menu';
import clsx from 'clsx';
import {
	Children,
	forwardRef,
	isValidElement,
	useId,
} from '@wordpress/element';
import type { ReactNode } from 'react';
import resetStyles from '../utils/css/resets.module.css';
import styles from './style.module.css';
import { MenuItemContentContext } from './context';
import { ItemDescription } from './item-description';
import { ItemLabel } from './item-label';
import type { ItemProps } from './types';

type ItemAriaProps = Pick<
	ItemProps,
	'aria-describedby' | 'aria-label' | 'aria-labelledby'
>;
type UseItemContentOptions = ItemAriaProps & {
	labelledBy?: string;
};

function getStructuredItemContent( children: ItemProps[ 'children' ] ) {
	const childArray = Children.toArray( children );
	const label = childArray.find(
		( child ) =>
			isValidElement< { id?: string } >( child ) &&
			child.type === ItemLabel
	);
	const description = childArray.find(
		( child ) =>
			isValidElement< { id?: string } >( child ) &&
			child.type === ItemDescription
	);

	return {
		descriptionId: isValidElement< { id?: string } >( description )
			? description.props.id
			: undefined,
		hasDescription: !! description,
		hasLabel: !! label,
		hasStructuredContent: childArray.some(
			( child ) =>
				isValidElement( child ) &&
				( child.type === ItemLabel || child.type === ItemDescription )
		),
		labelId: isValidElement< { id?: string } >( label )
			? label.props.id
			: undefined,
	};
}

function useItemContent(
	children: ItemProps[ 'children' ],
	{
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		labelledBy: additionalLabelledBy,
	}: UseItemContentOptions
) {
	const generatedLabelId = useId();
	const generatedDescriptionId = useId();
	const {
		descriptionId,
		hasDescription,
		hasLabel,
		hasStructuredContent,
		labelId,
	} = getStructuredItemContent( children );
	const resolvedLabelId =
		labelId ??
		( hasLabel || ! hasStructuredContent ? generatedLabelId : undefined );
	const resolvedDescriptionId = descriptionId ?? generatedDescriptionId;

	const describedBy = [
		ariaDescribedBy,
		hasDescription && resolvedDescriptionId,
	]
		.filter( Boolean )
		.join( ' ' );
	/*
	 * `aria-labelledby` takes precedence over `aria-label` in the accessible
	 * name algorithm. Only provide our generated label relationship when the
	 * consumer has not supplied either explicit naming prop. Additional labels
	 * are only appended to that generated relationship, so explicit naming stays
	 * fully consumer-controlled.
	 */
	const labelledBy =
		ariaLabelledBy ??
		( ariaLabel
			? undefined
			: [ resolvedLabelId, additionalLabelledBy ]
					.filter( Boolean )
					.join( ' ' ) || undefined );

	return {
		contentContextValue: {
			descriptionId: resolvedDescriptionId,
			labelId: resolvedLabelId,
		},
		itemAriaProps: {
			'aria-describedby': describedBy || undefined,
			'aria-label': ariaLabel,
			'aria-labelledby': labelledBy,
		},
	};
}

function getItemChildrenWithLabelSuffix(
	children: ItemProps[ 'children' ],
	labelSuffix?: ReactNode
) {
	const { hasStructuredContent } = getStructuredItemContent( children );

	if ( ! hasStructuredContent ) {
		const itemLabel = <ItemLabel>{ children }</ItemLabel>;

		return labelSuffix ? (
			<span className={ styles[ 'item-label-line' ] }>
				{ itemLabel }
				{ labelSuffix }
			</span>
		) : (
			itemLabel
		);
	}

	if ( ! labelSuffix ) {
		return children;
	}

	let didAppendLabelSuffix = false;

	return Children.toArray( children ).map( ( child, index ) => {
		if (
			! didAppendLabelSuffix &&
			isValidElement( child ) &&
			child.type === ItemLabel
		) {
			didAppendLabelSuffix = true;

			return (
				<span
					key={ child.key ?? `item-label-line-${ index }` }
					className={ styles[ 'item-label-line' ] }
				>
					{ child }
					{ labelSuffix }
				</span>
			);
		}

		return child;
	} );
}

function ItemContent( {
	children,
	labelSuffix,
	prefix,
	suffix,
}: Pick< ItemProps, 'children' | 'prefix' | 'suffix' > & {
	labelSuffix?: ReactNode;
} ) {
	const itemChildren = getItemChildrenWithLabelSuffix(
		children,
		labelSuffix
	);

	return (
		<>
			<span className={ styles[ 'item-content' ] }>
				{ prefix && (
					<span className={ styles[ 'item-prefix' ] }>
						{ prefix }
					</span>
				) }
				<span className={ styles[ 'item-children' ] }>
					{ itemChildren }
				</span>
				{ suffix && (
					<span className={ styles[ 'item-suffix' ] }>
						{ suffix }
					</span>
				) }
			</span>
		</>
	);
}

/**
 * Renders an individual menu item.
 */
const Item = forwardRef< HTMLDivElement, ItemProps >( function MenuItem(
	{
		children,
		className,
		prefix,
		suffix,
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		...props
	},
	ref
) {
	const { contentContextValue, itemAriaProps } = useItemContent( children, {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
	} );

	return (
		<_Menu.Item
			ref={ ref }
			{ ...itemAriaProps }
			className={ clsx(
				resetStyles[ 'box-sizing' ],
				styles.item,
				className
			) }
			{ ...props }
		>
			<MenuItemContentContext.Provider value={ contentContextValue }>
				<ItemContent prefix={ prefix } suffix={ suffix }>
					{ children }
				</ItemContent>
			</MenuItemContentContext.Provider>
		</_Menu.Item>
	);
} );

export { Item, ItemContent, useItemContent };
