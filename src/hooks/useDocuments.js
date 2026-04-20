import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDocuments, deleteDocument, uploadFile } from '../services/api';

export function useDocuments(storeId, apiKeyValue = null) {
  const queryClient = useQueryClient();

  const {
    data: documentsData,
    isLoading: loading,
    error: queryError,
    refetch: fetchDocuments,
  } = useQuery({
    queryKey: ['documents', storeId, apiKeyValue],
    queryFn: () => listDocuments(storeId, apiKeyValue),
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
    mutationFn: ({ file }) => uploadFile(storeId, file, apiKeyValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', storeId, apiKeyValue] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (docId) => deleteDocument(storeId, docId, apiKeyValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', storeId, apiKeyValue] });
    },
  });

  const upload = async (id, file) => {
    return uploadMutation.mutateAsync({ file });
  };

  const removeDocument = async (sid, docId) => {
    return removeMutation.mutateAsync(docId);
  };

  const clearDocuments = useCallback(() => {
    queryClient.setQueryData(['documents', storeId, apiKeyValue], null);
  }, [queryClient, storeId, apiKeyValue]);

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
