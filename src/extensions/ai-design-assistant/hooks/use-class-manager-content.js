import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useEntityRecords } from '@wordpress/core-data';
import { getEntityTitle } from '../../class-manager/utils';

const CLASS_POST_TYPE = 'blockish-classes';

const getEntityContent = (content) => {
	if (typeof content === 'string') {
		return content;
	}

	if (content && typeof content === 'object') {
		return content.raw || content.rendered || '';
	}

	return '';
};

export default function useClassManagerContent() {
	const { records } = useEntityRecords('postType', CLASS_POST_TYPE, {
		per_page: -1,
		context: 'edit',
	});

	const classIds = useMemo(
		() => (records || []).map((item) => item?.id).filter(Boolean),
		[records]
	);

	const editedClassesById = useSelect(
		(select) => {
			if (!classIds.length) {
				return {};
			}

			const store = select('core');
			return classIds.reduce((acc, id) => {
				acc[id] = store.getEditedEntityRecord('postType', CLASS_POST_TYPE, id) || null;
				return acc;
			}, {});
		},
		[classIds.join(',')]
	);

	return useMemo(() => {
		return (records || []).map((record) => {
			const classData = editedClassesById[record?.id] || record;

			return {
				id: classData?.id,
				title: getEntityTitle(classData?.title),
				content: getEntityContent(classData?.content),
				parent: classData?.parent || 0,
				modified: classData?.modified || '',
			};
		}).filter((item) => item?.id);
	}, [records, editedClassesById]);
}
