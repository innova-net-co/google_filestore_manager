import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDocuments, deleteDocument, uploadFile } from '../services/api';

export function useDocuments(storeId) {
  const queryClient = useQueryClient();

  const {
    data: documentsData,
    isLoading: loading,
    error: queryError,
    refetch: fetchDocuments,
  } = useQuery({
    queryKey: ['documents', storeId],
    queryFn: () => listDocuments(storeId),
    enabled: !!storeId,
    refetchInterval: (query) => {
      const docs = query.state.data?.documents || [];
      const hasPending = docs.some(doc => doc.state === 'STATE_PENDING');
      return hasPending ? 5000 : false;
    },
  });

  const documents = documentsData?.documents || [];
  const error = queryError?.message || null;

  const uploadMutation = useMutation({
    mutationFn: ({ file }) => uploadFile(storeId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', storeId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (docId) => deleteDocument(storeId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', storeId] });
    },
  });

  const upload = async (id, file) => {
    // Note: id is expected to be storeId, but we use the one from the hook context
    return uploadMutation.mutateAsync({ file });
  };

  const removeDocument = async (sid, docId) => {
    // Note: sid is expected to be storeId
    return removeMutation.mutateAsync(docId);
  };

  const clearDocuments = () => {
    queryClient.setQueryData(['documents', storeId], null);
  };

  return {
    documents,
    loading,
    uploading: uploadMutation.isPending,
    error,
    fetchDocuments,
    removeDocument,
    upload,
    clearDocuments,
  };
}
